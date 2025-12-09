import React, { useEffect, useMemo, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { toast } from "react-hot-toast";
import ReusableTable, { TableColumn } from "../../reusable-components/reusable-table";
import ReusableForm, { FormField } from "../../reusable-components/reusable-form";
import { getAuthRole } from "../../utils/tokenStorage";

type UserDTO = {
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
    profilePhotoPath?: string | null;
    createdAt?: string | null;
    active?: boolean;
};

export default function UserManagement() {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<UserDTO | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            setLoading(true);
            const res = await axiosClient.get<UserDTO[]>("/admin/users");
            setUsers(res.data);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }

    async function toggleUserStatus(user: UserDTO) {
        const action = user.active ? "deactivate" : "activate";

        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            await axiosClient.patch(`/api/admin/users/${user.userId}/${action}`);
            toast.success(`User ${action}d`);

            setUsers(prev =>
                prev.map(u => (u.userId === user.userId ? { ...u, active: !user.active } : u))
            );
        } catch (err) {
            toast.error(`Failed to ${action} user`);
        }
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return users;
        return users.filter(u =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.phoneNumber || "").toLowerCase().includes(q) ||
            (u.role || "").toLowerCase().includes(q)
        );
    }, [users, search]);


    const columns: TableColumn<UserDTO>[] = [
        {
            key: "profilePhotoPath",
            label: "Avatar",
            render: (row) => (
                <img
                    src={row.profilePhotoPath || "/default-avatar.png"}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                />
            ),
        },
        { key: "firstName", label: "First Name" },
        { key: "lastName", label: "Last Name" },
        { key: "email", label: "Email" },
        { key: "phoneNumber", label: "Phone" },
        { key: "role", label: "Role" },
        {
            key: "active",
            label: "Status",
            render: (row) => (
                <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${row.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                >
                    {row.active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => toggleUserStatus(row)}
                        className={`px-3 py-1 text-white rounded text-sm ${row.active ? "bg-red-500" : "bg-green-600"
                            }`}
                    >
                        {row.active ? "Deactivate" : "Activate"}
                    </button>

                    {/* <button
                        onClick={() => {
                            setEditing(row);
                            setOpenForm(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                        Edit
                    </button> */}
                </div>
            ),
        },
    ];

    const userFields: FormField[] = [
        { name: "firstName", label: "First Name", required: true,validate: (v: string) =>/^[A-Za-z]{2,30}$/.test(v) || "Enter a valid first name (letters only).", },
        { name: "lastName", label: "Last Name", required: true, validate: (v: string) => /^[A-Za-z]{2,30}$/.test(v) || "Enter a valid last name (letters only).",},
        { name: "email", label: "Email", type: "email", required: true, validate: (v: string) => /\S+@\S+\.\S+/.test(v) || "Enter a valid email address.",},
        { name: "phoneNumber", label: "Phone",required: true, validate: (v: string) => /^(07\d{8}|01\d{8}|\+2547\d{8})$/.test(v) ||"Enter a valid phone: 07XXXXXXXX, 01XXXXXXXX or +2547XXXXXXX",},
        {
            name: "role",
            label: "Role",
            type: "select",
            options: ["ADMIN"],
            required: true,
        },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>

                <input
                    type="text"
                    placeholder="Search user..."
                    className="border px-3 py-2 rounded-md w-full sm:w-72 focus:ring-2 focus:ring-blue-400 transition"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex justify-between items-center">
                <button
                    onClick={() => {
                        setEditing(null);
                        setOpenForm(true);
                    }}
                    className="bg-orange-700 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                    + Add Admin
                </button>
            </div>


            {/* Table Wrapper */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <ReusableTable
                    data={filtered}
                    columns={columns}
                    loading={loading}
                    noDataMessage="No users found"
                />
            </div>

            {/* Edit Modal */}
            {openForm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="w-full max-w-lg">
                        <ReusableForm
                            fields={userFields}
                            data={editing}
                            endpoint={editing ? `/admin/users/${editing.userId}` : `/admin/users`}
                            method={editing ? "PUT" : "POST"}
                            transformData={(form) =>({
                                ...form, creatorRole: getAuthRole(),
                            })}
                            onSuccess={() => fetchUsers()}
                            onClose={() => {
                                setOpenForm(false);
                                setEditing(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
