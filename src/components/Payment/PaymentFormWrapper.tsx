import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import PaymentForm from "./PaymentForm";

export default function PaymentFormWrapper() {
  const { bookingId } = useParams();
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAmount = async () => {
      const res = await axiosClient.get(`/bookings/${bookingId}`);
      setTotalAmount(res.data.totalAmount);
    };
    fetchAmount();
  }, [bookingId]);

  if (!totalAmount) return <p>Loading...</p>;

  return (
    <PaymentForm
      bookingId={bookingId!}
      totalAmount={totalAmount}
      onClose={() => (window.location.href = "/bookings")}
    />
  );
}
