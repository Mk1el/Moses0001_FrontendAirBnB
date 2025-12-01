import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";

interface PaymentFormProps {
  bookingId: string;
  totalAmount: number;
  onClose: () => void;
}

type PaymentMethod = "MPESA" | "AIRTEL" | "STRIPE" | "PAYPAL";

const PaymentForm: React.FC<PaymentFormProps> = ({ bookingId, totalAmount, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if ((paymentMethod === "MPESA" || paymentMethod === "AIRTEL") && !phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      setLoading(true);

      const body = {
        bookingId: bookingId,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber || "N/A",
        returnUrl: window.location.origin + "/payment/success",
        cancelUrl: window.location.origin + "/payment/cancel",
      };

      const res = await axiosClient.post("/api/payments/pay", body);
      toast.success(`Payment initiated via ${paymentMethod}`);

      // handle redirect (for PayPal/Stripe)
      if (res.data.redirectUrl) {
        window.location.href = res.data.redirectUrl;
      } else {
        toast("Awaiting confirmation...");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Complete Your Payment
        </h2>

        <div className="mb-4 text-center">
          <p className="text-gray-600">Booking ID: <b>{bookingId}</b></p>
          <p className="text-xl font-bold text-green-700 mt-2">KSh {totalAmount}</p>
        </div>

        <label className="block mb-2 font-medium text-gray-700">Select Payment Method:</label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["MPESA", "AIRTEL", "PAYPAL", "STRIPE"] as PaymentMethod[]).map((method) => (
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
          ))}
        </div>

        {(paymentMethod === "MPESA" || paymentMethod === "AIRTEL") && (
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
          >
            Cancel
          </button>
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
      </div>
    </div>
  );
};

export default PaymentForm;
