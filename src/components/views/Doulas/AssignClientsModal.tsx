import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { PreggaColors } from "../../../theme/colors";
import { Modal } from "../../ui/Modal";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { assignClientToDoula, fetchUnassignedUsers } from "../../../lib/api";
import { friendlyError } from "../../../lib/errors";
import { invalidateCache } from "../../../hooks";
import type { UserWithProfile } from "../../../types/database";
import { Search, UserPlus, Check, Loader2 } from "lucide-react";

interface AssignClientsModalProps {
  open: boolean;
  onClose: () => void;
  doulaId: string;
  doulaName: string;
}

export function AssignClientsModal({ open, onClose, doulaId, doulaName }: AssignClientsModalProps) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const data = await fetchUnassignedUsers(doulaId, query || undefined);
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [doulaId]);

  useEffect(() => {
    if (open) {
      loadUsers("");
      setAssignedIds(new Set());
      setSearch("");
    }
  }, [open, loadUsers]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => loadUsers(search), 300);
    return () => clearTimeout(timer);
  }, [search, open, loadUsers]);

  const handleAssign = async (user: UserWithProfile) => {
    setAssigningId(user.id);
    try {
      await assignClientToDoula(doulaId, user.id);
      setAssignedIds((prev) => new Set(prev).add(user.id));
      toast.success(`${user.display_name || "User"} assigned to ${doulaName}`);
      invalidateCache("doula");
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setAssigningId(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const calculateWeek = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const weeksUntilDue = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = 40 - weeksUntilDue;
    return currentWeek > 0 && currentWeek <= 42 ? currentWeek : null;
  };

  return (
    <Modal open={open} onClose={handleClose} title={`Assign Clients to ${doulaName}`} width={520}>
      <div>
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
          showClear
          onClear={() => setSearch("")}
          style={{ marginBottom: 16 }}
        />

        <div
          style={{
            maxHeight: 380,
            overflowY: "auto",
            borderRadius: 12,
            border: `1px solid ${PreggaColors.neutral100}`,
          }}
        >
          {isLoading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <Loader2 size={20} color={PreggaColors.accent500} style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 13, color: PreggaColors.neutral500, marginTop: 8 }}>Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: PreggaColors.neutral500, margin: 0 }}>
                {search ? "No matching users found" : "All users are already assigned"}
              </p>
            </div>
          ) : (
            users.map((user) => {
              const justAssigned = assignedIds.has(user.id);
              const isAssigning = assigningId === user.id;
              const week = calculateWeek(user.pregnant_profiles?.due_date || null);

              return (
                <div
                  key={user.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderBottom: `1px solid ${PreggaColors.neutral100}`,
                    opacity: justAssigned ? 0.5 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: PreggaColors.primary100,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: PreggaColors.primary600,
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: "hidden",
                      }}
                    >
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        (user.display_name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14, color: PreggaColors.neutral900 }}>
                        {user.display_name || "Unnamed"}
                      </div>
                      <div style={{ fontSize: 12, color: PreggaColors.neutral500 }}>
                        {user.email || user.phone || "No contact"}
                        {week ? ` · Week ${week}` : ""}
                      </div>
                    </div>
                  </div>

                  {justAssigned ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: PreggaColors.success600, fontSize: 13, fontWeight: 500 }}>
                      <Check size={16} />
                      Assigned
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssign(user)}
                      loading={isAssigning}
                      icon={<UserPlus size={14} />}
                    >
                      Assign
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="outline" onClick={handleClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
