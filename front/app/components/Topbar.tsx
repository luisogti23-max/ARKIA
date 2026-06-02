"use client";

import { FiLogOut } from "react-icons/fi";

export default function Topbar({ title }: { title: string }) {
  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; Max-Age=0; path=/;";
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <button className="logout-btn" onClick={logout}>
        <FiLogOut /> Salir
      </button>
    </header>
  );
}
