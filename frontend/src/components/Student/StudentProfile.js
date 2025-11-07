import React, { useEffect, useState } from "react";

export default function StudentProfile() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    year: "",
    address: "",
    avatarUrl: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("authToken") || "";
        const res = await fetch("/api/student/profile", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setStudent((s) => ({ ...s, ...data }));
      } catch (err) {
        setError(err.message || "Error loading profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setStudent((s) => ({ ...s, [name]: value }));
  }

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setStudent((s) => ({ ...s, avatarUrl: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken") || "";
      if (avatarFile) {
        const formData = new FormData();
        formData.append("name", student.name);
        formData.append("email", student.email);
        formData.append("phone", student.phone);
        formData.append("course", student.course);
        formData.append("year", student.year);
        formData.append("address", student.address);
        formData.append("avatar", avatarFile);
        const res = await fetch("/api/student/profile", {
          method: "PUT",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
          body: formData,
        });
        if (!res.ok) throw new Error("Save failed");
      } else {
        const res = await fetch("/api/student/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(student),
        });
        if (!res.ok) throw new Error("Save failed");
      }
      alert("Profile saved");
    } catch (err) {
      setError(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }

  const styles = {
    container: {
      maxWidth: 760,
      margin: "24px auto",
      padding: 20,
      border: "1px solid #eee",
      borderRadius: 8,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      background: "#fff",
    },
    header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 18 },
    avatar: { width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" },
    formRow: { display: "flex", gap: 12, marginBottom: 12 },
    input: { flex: 1, padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" },
    label: { fontSize: 13, color: "#333", marginBottom: 6, display: "block" },
    btnPrimary: { padding: "10px 14px", background: "#0066ff", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
    btnSecondary: { padding: "10px 14px", background: "#eee", color: "#111", border: "none", borderRadius: 6, cursor: "pointer" },
    error: { color: "#b00020", marginBottom: 12 },
  };

  if (loading) return <div style={{ padding: 20 }}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img
          src={student.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          style={styles.avatar}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{student.name || "Student Name"}</h2>
          <div style={{ color: "#666", marginTop: 6 }}>{student.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btnSecondary} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Full name</label>
            <input name="name" value={student.name} onChange={handleChange} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Email</label>
            <input name="email" value={student.email} onChange={handleChange} style={styles.input} type="email" />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Phone</label>
            <input name="phone" value={student.phone} onChange={handleChange} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Course</label>
            <input name="course" value={student.course} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Year / Semester</label>
            <input name="year" value={student.year} onChange={handleChange} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Address</label>
            <input name="address" value={student.address} onChange={handleChange} style={styles.input} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={styles.label}>Avatar (optional)</label>
          <input type="file" accept="image/*" onChange={handleAvatar} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={styles.btnPrimary} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button type="button" style={styles.btnSecondary} onClick={() => window.location.reload()}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
