import { useState } from "react";
import axiosClient from "../api/axiosClient";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "date" | "email" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

interface ReusableFormProps<T> {
  fields: FormField[];
  data?: T;
  endpoint: string;
  method?: "POST" | "PUT";
  onSuccess: () => void;
  onClose?: () => void;
}

export default function ReusableForm<T>({
  fields,
  data,
  endpoint,
  method = "POST",
  onSuccess,
  onClose,
}: ReusableFormProps<T>) {
  const [form, setForm] = useState<any>(
    fields.reduce(
      (acc, f) => ({ ...acc, [f.name]: (data as any)?.[f.name] || "" }),
      {}
    )
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response =
        method === "POST"
          ? await axiosClient.post(endpoint, form)
          : await axiosClient.put(endpoint, form);

      console.log("Form Submitted:", response.data);
      onSuccess();
      onClose?.();
    } catch (error: any) {
      console.error("Submission error:", error?.response || error?.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4"
    >
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1">
          <label className="text-gray-700 font-medium">{field.label}</label>

          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="p-2 border rounded-md focus:ring focus:ring-blue-300 outline-none"
            />
          ) : field.type === "select" ? (
            <select
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required}
              className="p-2 border rounded-md focus:ring focus:ring-blue-300 outline-none"
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field.name}
              type={field.type || "text"}
              value={form[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              className="p-2 border rounded-md focus:ring focus:ring-blue-300 outline-none"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
}
