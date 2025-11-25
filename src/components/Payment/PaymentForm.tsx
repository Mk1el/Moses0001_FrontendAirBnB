import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";
import Modal from "../../reusable-components/reusable-dialog";


interface PaymentFormProps {
  bookingId: string;
  totalAmount: number;
  onClose: () => void; // Passed to Modal also
}

type PaymentMethod = "MPESA" | "AIRTEL" | "STRIPE" | "PAYPAL";

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  totalAmount,
  onClose,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!paymentMethod) return toast.error("Please select a payment method");

    if ((paymentMethod === "MPESA" || paymentMethod === "AIRTEL") && !phoneNumber) {
      return toast.error("Please enter your phone number");
    }

    try {
      setLoading(true);

      const body = {
        bookingId,
        amount: totalAmount,
        paymentMethod,
        phoneNumber: phoneNumber || "N/A",
        returnUrl: window.location.origin + "/payment/success",
        cancelUrl: window.location.origin + "/payment/cancel",
      };

      const res = await axiosClient.post("/payments/pay", body);
      toast.success(`Payment initiated via ${paymentMethod}`);

      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        toast("Awaiting confirmation...");
      }

      onClose(); // Close modal after success
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} title="Complete Your Payment" onClose={onClose}>
      {/* INSIDE MODAL CONTENT */}
      <div className="mb-4 text-center">
        <p className="text-gray-600">
          Booking ID: <b>{bookingId}</b>
        </p>
        <p className="text-xl font-bold text-green-700 mt-2">
          KSh {totalAmount}
        </p>
      </div>

      <label className="block mb-2 font-medium text-gray-700">
        Select Payment Method:
      </label>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {(["MPESA", "AIRTEL", "PAYPAL", "STRIPE"] as PaymentMethod[]).map(
          (method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`border rounded-lg py-2 text-sm font-semibold transition ${
                paymentMethod === method
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {method}
            </button>
          )
        )}
      </div>

      {(paymentMethod === "MPESA" || paymentMethod === "AIRTEL") && (
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 254712345678"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          disabled={loading}
          onClick={handlePay}
          className={`px-4 py-2 rounded-lg text-white ${
            loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentForm;
