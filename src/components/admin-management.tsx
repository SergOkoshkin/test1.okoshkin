"use client";

import { useMemo, useState } from "react";

type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
type CommentStatus = "PENDING" | "APPROVED" | "REJECTED";

type Lead = {
  id: string;
  name: string;
  phone: string;
  productType: string;
  estimateMin: number;
  estimateMax: number;
  status: LeadStatus;
};

type CommentItem = {
  id: string;
  name: string;
  body: string;
  rating: number;
  photoUrl: string | null;
  status: CommentStatus;
};

type Props = {
  locale: "ru" | "uk";
  initialLeads: Lead[];
  initialComments: CommentItem[];
};

const leadStatuses: LeadStatus[] = ["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"];
const commentStatuses: CommentStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export function AdminManagement({ locale, initialLeads, initialComments }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [comments, setComments] = useState(initialComments);
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);

  const i18n = useMemo(
    () =>
      locale === "uk"
        ? {
            leads: "Заявки",
            comments: "Відгуки",
            noLeads: "Немає заявок.",
            noComments: "Немає відгуків.",
            save: "Зберегти",
            remove: "Видалити",
          }
        : {
            leads: "Заявки",
            comments: "Отзывы",
            noLeads: "Нет заявок.",
            noComments: "Нет отзывов.",
            save: "Сохранить",
            remove: "Удалить",
          },
    [locale],
  );

  function showMessage(text: string, success: boolean) {
    setMessage(text);
    setOk(success);
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    setBusyLeadId(id);
    const response = await fetch(`/api/admin/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyLeadId(null);

    if (!response.ok) return;
    setLeads((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    showMessage(locale === "uk" ? "Заявку оновлено." : "Заявка обновлена.", true);
  }

  async function saveComment(item: CommentItem) {
    setBusyCommentId(item.id);
    setMessage(null);

    const response = await fetch(`/api/admin/comments/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = (await response.json()) as {
      ok: boolean;
      message?: string;
      item?: CommentItem;
    };
    setBusyCommentId(null);
    if (!response.ok || !data.ok) {
      showMessage(data.message ?? "Failed to save comment", false);
      return;
    }
    if (data.item) {
      setComments((prev) => prev.map((x) => (x.id === item.id ? data.item! : x)));
    }
    showMessage(locale === "uk" ? "Відгук збережено." : "Отзыв сохранен.", true);
  }

  async function deleteComment(id: string) {
    setBusyCommentId(id);
    const response = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    setBusyCommentId(null);
    if (!response.ok) {
      showMessage(locale === "uk" ? "Не вдалося видалити." : "Не удалось удалить.", false);
      return;
    }
    setComments((prev) => prev.filter((item) => item.id !== id));
    showMessage(locale === "uk" ? "Відгук видалено." : "Отзыв удален.", true);
  }

  return (
    <div className="mt-8 grid gap-8">
      {message && (
        <p
          className={`rounded-xl border px-4 py-2 text-sm ${
            ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <section className="rounded-2xl border border-[var(--line-soft)] p-5">
        <h2 className="text-xl font-semibold">{i18n.leads}</h2>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-soft)]">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Client</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Estimate</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-[var(--text-muted)]">
                    {i18n.noLeads}
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-[var(--line-soft)]">
                  <td className="px-3 py-2">{lead.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">
                    <div>{lead.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{lead.phone}</div>
                  </td>
                  <td className="px-3 py-2">{lead.productType}</td>
                  <td className="px-3 py-2">
                    {lead.estimateMin} - {lead.estimateMax}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={lead.status}
                      disabled={busyLeadId === lead.id}
                      onChange={(event) => updateLeadStatus(lead.id, event.target.value as LeadStatus)}
                      className="rounded-md border border-[var(--line-soft)] px-2 py-1"
                    >
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line-soft)] p-5">
        <h2 className="text-xl font-semibold">{i18n.comments}</h2>
        <div className="mt-4 grid gap-3">
          {comments.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">{i18n.noComments}</p>
          )}
          {comments.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--line-soft)] p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={item.name}
                  onChange={(event) =>
                    setComments((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, name: event.target.value } : x)),
                    )
                  }
                  className="rounded-lg border border-[var(--line-soft)] px-3 py-2"
                />
                <input
                  value={item.photoUrl ?? ""}
                  placeholder="https://..."
                  onChange={(event) =>
                    setComments((prev) =>
                      prev.map((x) => (x.id === item.id ? { ...x, photoUrl: event.target.value } : x)),
                    )
                  }
                  className="rounded-lg border border-[var(--line-soft)] px-3 py-2"
                />
              </div>
              <textarea
                rows={3}
                value={item.body}
                onChange={(event) =>
                  setComments((prev) =>
                    prev.map((x) => (x.id === item.id ? { ...x, body: event.target.value } : x)),
                  )
                }
                className="mt-2 w-full resize-none rounded-lg border border-[var(--line-soft)] px-3 py-2"
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <select
                  value={item.rating}
                  onChange={(event) =>
                    setComments((prev) =>
                      prev.map((x) =>
                        x.id === item.id ? { ...x, rating: Number(event.target.value) } : x,
                      ),
                    )
                  }
                  className="rounded-lg border border-[var(--line-soft)] px-3 py-2"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}/5
                    </option>
                  ))}
                </select>
                <select
                  value={item.status}
                  onChange={(event) =>
                    setComments((prev) =>
                      prev.map((x) =>
                        x.id === item.id
                          ? { ...x, status: event.target.value as CommentStatus }
                          : x,
                      ),
                    )
                  }
                  className="rounded-lg border border-[var(--line-soft)] px-3 py-2"
                >
                  {commentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => saveComment(item)}
                    disabled={busyCommentId === item.id}
                    className="flex-1 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {i18n.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteComment(item.id)}
                    disabled={busyCommentId === item.id}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
                  >
                    {i18n.remove}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
