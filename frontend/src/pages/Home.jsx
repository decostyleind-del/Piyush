import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="brand">
          DECO<span>.LEAVE</span>
        </div>
        <div className="header-actions">
          <Link to="/login" className="btn btn-secondary">
            Staff Portal
          </Link>
          <Link to="/login" className="btn btn-primary">
            Sign In <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="hero-badge">
          <Sparkles size={14} /> Enterprise Leave Management System
        </div>

        <h1 className="hero-title">
          Streamline employee leave with <span>total transparency</span>
        </h1>

        <p className="hero-subtitle">
          Submit, track, and manage leave requests in one unified platform —
          built for efficient employee applications, independent HOD and HR
          reviews, and secure administrative oversight.
        </p>

        <div className="hero-cta" style={{ marginBottom: "1rem" }}>
          <Link to="/login" className="btn btn-primary btn-large">
            Access portal <ArrowRight size={18} />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon icon-indigo">
              <Calendar size={22} />
            </div>
            <h3>Easy applications</h3>
            <p>
              Employees apply in a few clicks, with instant status updates and a
              full leave history on record.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-emerald">
              <Users size={22} />
            </div>
            <h3>Independent approvals</h3>
            <p>
              HODs and HR review and approve requests independently, so teams
              stay in sync without bottlenecks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-amber">
              <ShieldCheck size={22} />
            </div>
            <h3>Administrative oversight</h3>
            <p>
              Admins retain final override authority across every request, with
              a full audit trail of who decided what.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        Having trouble signing in? Contact your department manager or HR
        administration.
      </footer>
    </div>
  );
}
