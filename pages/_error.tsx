import type { NextPageContext } from "next";

export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
        {statusCode ? `${statusCode} - Terjadi Kesalahan` : "Terjadi Kesalahan"}
      </h1>
      <p style={{ marginTop: "0.75rem", color: "#666" }}>
        Layanan sedang mengalami kendala. Silakan kembali ke beranda.
      </p>
      <a
        href="/"
        style={{
          display: "inline-block",
          marginTop: "1.5rem",
          padding: "0.5rem 1.25rem",
          backgroundColor: "#2563eb",
          color: "#fff",
          borderRadius: "9999px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Ke Beranda
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
