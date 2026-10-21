"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PaymentOptions from "@/components/PaymentOptions";
import { formatETB } from "@/lib/payment-config";

export default function CheckoutPanel({ bookingId }) {
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      setLoading(true);
      setError("");
      setBooking(null);

      if (!bookingId) {
        setError(
          "Select a booking first. Submit a trip request from the Plan a trip page.",
        );
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/bookings/${encodeURIComponent(bookingId)}`,
          {
            cache: "no-store",
            credentials: "same-origin",
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Unable to load booking.");
        }

        if (!data.booking) {
          throw new Error("The requested booking was not found.");
        }

        if (!cancelled) {
          setBooking(data.booking);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load booking.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const submitPayment = useCallback(
    async (details) => {
      if (submittingRef.current || !bookingId) {
        return;
      }

      submittingRef.current = true;
      setSubmitting(true);
      setError("");
      setMessage("");
      setPaymentReference("");

      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          cache: "no-store",
          body: JSON.stringify({
            bookingId,
            ...details,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.error || "Unable to submit payment request.");
        }

        setPaymentReference(
          result.payment?.id ? String(result.payment.id) : "",
        );

        setMessage(
          result.message || "Your payment request was submitted successfully.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit payment request.",
        );
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [bookingId],
  );

  if (loading) {
    return <p role="status">Loading booking details...</p>;
  }

  if (!booking) {
    return (
      <div className="empty-state">
        <p role="alert">{error || "Booking details are unavailable."}</p>

        <p>
          <Link href="/login">Sign in</Link>
          {" · "}
          <Link href="/plan-trip">Plan a trip</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="card">
        <h2>Booking summary</h2>

        <p>
          <strong>{booking.destinationName || "Destination"}</strong>
        </p>

        <p>Travel date: {booking.travelDate || "Not specified"}</p>

        <p>Travelers: {booking.travelers ?? "Not specified"}</p>

        <p>Booking status: {booking.status || "Pending"}</p>

        <p>Payment status: {booking.paymentStatus || "Pending"}</p>

        <hr />

        <p>
          Tour subtotal: <strong>{formatETB(booking.amountETB)}</strong>
        </p>

        <p className="muted">
          The server must calculate the service fee and total from the saved
          booking amount. Never trust amounts supplied by the browser.
        </p>
      </section>

      {booking.paymentStatus === "paid" ? (
        <div className="empty-state">
          <h2>Payment recorded</h2>
          <p>This booking is already marked as paid.</p>
        </div>
      ) : (
        <PaymentOptions
          amount={booking.amountETB}
          onSubmit={submitPayment}
          disabled={submitting}
        />
      )}

      {submitting && <p role="status">Submitting payment request...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {message && (
        <div className="empty-state" role="status">
          <h2>Payment request received</h2>

          <p>{message}</p>

          {paymentReference && (
            <p>
              Payment reference: <strong>{paymentReference}</strong>
            </p>
          )}

          <p>
            Your payment remains pending until an authorized administrator
            independently verifies the transaction. A submitted reference is not
            proof of payment.
          </p>

          <Link href="/notifications">View notifications</Link>
        </div>
      )}
    </div>
  );
}
