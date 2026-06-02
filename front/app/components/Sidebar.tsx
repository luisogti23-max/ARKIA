"use client";

import Link from "next/link";
import { FiHome, FiUser, FiSettings, FiBarChart } from "react-icons/fi";

export default function Sidebar({ role }: { role: "admin" | "usuario" }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">ARK <span>AI</span></h2>

      <nav>
        <Link href={`/${role}`}>
          <FiHome /> Dashboard
        </Link>

        {role === "admin" && (
          <>
            <Link href="/admin/usuarios">
              <FiUser /> Usuarios
            </Link>
            <Link href="/admin/reportes">
              <FiBarChart /> Reportes
            </Link>
          </>
        )}

        <Link href={`/${role}/configuracion`}>
          <FiSettings /> Configuración
        </Link>
      </nav>
    </aside>
  );
}
