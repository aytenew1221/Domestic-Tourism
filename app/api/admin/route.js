import { NextResponse } from "next/server";
import { requireAdmin, requireStaffOrAdmin, hashPassword } from "@/lib/auth";

import {
  listUsers,
  getBookings,
  getPaymentRequests,
  setUserRole,
  updatePaymentRequest,
  updateBooking,
  createNotification,
  createUser,
  deleteUser,
} from "@/lib/store";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    users: listUsers(),
    bookings: await getBookings(),
    payments: getPaymentRequests(),
  });
}

export async function PATCH(request) {
  const operator = await requireStaffOrAdmin();

  if (!operator) {
    return NextResponse.json(
      { error: "Staff or administrator access required." },
      { status: 403 },
    );
  }

  const isAdmin = operator.role === "admin";
  const admin = isAdmin ? operator : null;

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Create a staff account. Administrators only.
  if (body?.action === "create_staff") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const password = typeof body.password === "string" ? body.password : "";

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
      name.length < 2 ||
      name.length > 120 ||
      !validEmail ||
      password.length < 12 ||
      password.length > 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Provide a valid name, email, and password of at least 12 characters.",
        },
        { status: 400 },
      );
    }

    try {
      const existingUser = listUsers().some(
        (user) => user.email.toLowerCase() === email,
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }

      const user = createUser({
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "staff",
        emailVerifiedAt: new Date().toISOString(),
      });

      return NextResponse.json({ user }, { status: 201 });
    } catch {
      return NextResponse.json(
        { error: "Unable to create staff account." },
        { status: 400 },
      );
    }
  }

  // Delete an account. Administrators only.
  if (body?.action === "delete_user") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    const userId = typeof body.userId === "string" ? body.userId : "";

    if (!userId || userId === admin.id) {
      return NextResponse.json(
        {
          error: "You cannot delete your own administrator account.",
        },
        { status: 400 },
      );
    }

    const target = listUsers().find((user) => user.id === userId);

    if (!target) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 },
      );
    }

    if (target.role === "admin") {
      return NextResponse.json(
        {
          error: "Administrator accounts cannot be deleted here.",
        },
        { status: 403 },
      );
    }

    const deleted = deleteUser(userId);

    return NextResponse.json({ deleted });
  }

  // Change account role. Administrators only.
  if (body?.action === "set_role") {
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    const userId = typeof body.userId === "string" ? body.userId : "";

    const role = body.role;

    if (userId === admin.id) {
      return NextResponse.json(
        { error: "You cannot change your own role." },
        { status: 400 },
      );
    }

    const user = setUserRole(userId, role);

    if (!user) {
      return NextResponse.json(
        { error: "User or role is invalid." },
        { status: 400 },
      );
    }

    createNotification({
      userId,
      type: "role_changed",
      title: "Account access updated",
      message: `Your account role is now ${role}.`,
    });

    return NextResponse.json({ user });
  }

  // Verify a payment. Staff and administrators.
  if (body?.action === "verify_payment") {
    const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";

    const decision = body.decision;

    const verificationReference =
      typeof body.verificationReference === "string"
        ? body.verificationReference.trim()
        : "";

    if (!paymentId || !["paid", "rejected"].includes(decision)) {
      return NextResponse.json(
        { error: "Provide a valid payment decision." },
        { status: 400 },
      );
    }

    if (decision === "paid" && verificationReference.length < 4) {
      return NextResponse.json(
        {
          error:
            "A verified transaction reference is required before marking paid.",
        },
        { status: 400 },
      );
    }

    const payment = updatePaymentRequest(paymentId, {
      status: decision,
      verifiedAt: new Date().toISOString(),
      verifiedBy: operator.id,
      verificationReference: decision === "paid" ? verificationReference : null,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment request not found." },
        { status: 404 },
      );
    }

    await updateBooking(payment.bookingId, {
      paymentStatus: decision,
    });

    createNotification({
      userId: payment.userId,
      type: `payment_${decision}`,
      title: decision === "paid" ? "Payment verified" : "Payment not verified",
      message:
        decision === "paid"
          ? "An authorized staff member recorded the payment as verified. Keep your transaction reference."
          : "The submitted payment could not be verified. Contact support or submit corrected details.",
      relatedId: payment.bookingId,
    });

    return NextResponse.json({ payment });
  }

  return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
}
