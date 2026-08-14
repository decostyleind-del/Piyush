/**
 * Computes the overall workflow status of a leave request.
 *
 * Workflow rules (parallel HOD/HR, MD override, 2-hour auto-finalize):
 *   - HOD and HR act independently, in any order. Neither has to wait
 *     for the other.
 *   - MD (Admin) can approve or reject at ANY time, at any point, and
 *     that decision always wins over whatever HOD/HR decided.
 *   - If either HOD or HR rejects (and MD hasn't approved), the request
 *     is rejected.
 *   - Once BOTH HOD and HR have approved, the request sits at
 *     "pending_md" (awaiting Admin) — unless Admin does not act within
 *     AUTO_APPROVE_WINDOW_MS of the original submission, in which case
 *     it auto-finalizes as "approved".
 *
 * Priority (highest wins):
 *   1. cancelled       -> employee withdrew it, nothing overrides this
 *   2. md rejected      -> rejected, no matter what HOD/HR said
 *   3. md approved      -> approved, no matter what HOD/HR said
 *   4. hod rejected OR hr rejected -> rejected
 *   5. hod approved AND hr approved, MD still pending:
 *        - 2+ hours since submission -> approved (auto-finalized)
 *        - otherwise                 -> pending_md
 *   6. hod approved, hr still pending -> pending_hr
 *   7. hr approved, hod still pending -> pending_hod
 *   8. neither has acted yet          -> pending
 */

const AUTO_APPROVE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours

function computeOverallStatus(leave, now = new Date()) {
  if (leave.status === "cancelled") return "cancelled";

  if (leave.mdDecision?.status === "rejected") return "rejected";
  if (leave.mdDecision?.status === "approved") return "approved";

  const hodApproved = leave.hodDecision?.status === "approved";
  const hrApproved = leave.hrDecision?.status === "approved";

  if (leave.hodDecision?.status === "rejected") return "rejected";
  if (leave.hrDecision?.status === "rejected") return "rejected";

  if (hodApproved && hrApproved) {
    const elapsed = now.getTime() - new Date(leave.createdAt).getTime();
    if (elapsed >= AUTO_APPROVE_WINDOW_MS) return "approved";
    return "pending_md";
  }

  if (hodApproved && !hrApproved) return "pending_hr";
  if (hrApproved && !hodApproved) return "pending_hod";
  return "pending";
}

/**
 * Milliseconds remaining before this request would auto-finalize as
 * approved, if it's currently sitting at pending_md. Returns null when
 * not applicable (not at that stage, or already past the window - the
 * caller should have already auto-finalized it in that case).
 */
function msUntilAutoApprove(leave, now = new Date()) {
  const hodApproved = leave.hodDecision?.status === "approved";
  const hrApproved = leave.hrDecision?.status === "approved";
  if (!hodApproved || !hrApproved) return null;
  if (leave.mdDecision?.status && leave.mdDecision.status !== "pending") return null;

  const deadline = new Date(leave.createdAt).getTime() + AUTO_APPROVE_WINDOW_MS;
  const remaining = deadline - now.getTime();
  return remaining > 0 ? remaining : 0;
}

/**
 * Given a leave document already fetched from the DB, checks whether it
 * should auto-finalize (both HOD+HR approved, MD silent for 2+ hours) and,
 * if so, mutates + saves it with an audit-log entry. Returns the (possibly
 * updated) document. Safe to call on every read.
 */
async function autoFinalizeIfDue(leave, now = new Date()) {
  const hodApproved = leave.hodDecision?.status === "approved";
  const hrApproved = leave.hrDecision?.status === "approved";
  const mdStillPending = !leave.mdDecision?.status || leave.mdDecision.status === "pending";
  const alreadyFinal = ["approved", "rejected", "cancelled"].includes(leave.status);

  if (!alreadyFinal && hodApproved && hrApproved && mdStillPending) {
    const elapsed = now.getTime() - new Date(leave.createdAt).getTime();
    if (elapsed >= AUTO_APPROVE_WINDOW_MS) {
      leave.status = "approved";
      leave.approvals.push({
        stage: "md",
        actor: null,
        action: "auto_approved",
        comment: "Auto-approved: HOD and HR both approved and Admin took no action within 2 hours.",
      });
      await leave.save();
    }
  }
  return leave;
}

async function autoFinalizeAll(leaves, now = new Date()) {
  for (const leave of leaves) {
    await autoFinalizeIfDue(leave, now);
  }
  return leaves;
}

module.exports = {
  computeOverallStatus,
  msUntilAutoApprove,
  autoFinalizeIfDue,
  autoFinalizeAll,
  AUTO_APPROVE_WINDOW_MS,
};
