"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
  isPublished: boolean;
};

type GalleryDraft = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isPublished: boolean;
};

type Props = {
  locale: "ru" | "uk";
  isAdmin: boolean;
  initialItems: GalleryItem[];
};

type I18n = {
  title: string;
  subtitle: string;
  adminPanel: string;
  add: string;
  save: string;
  remove: string;
  cancel: string;
  published: string;
  hidden: string;
  photoUrl: string;
  photoFile: string;
  titleField: string;
  categoryField: string;
  descriptionField: string;
  noItems: string;
  open: string;
  edit: string;
  newItem: string;
  editItem: string;
  all: string;
  close: string;
  hint: string;
  slide: string;
  createOk: string;
  saveOk: string;
  deleteOk: string;
  confirmDelete: string;
};

const COPY: Record<"ru" | "uk", I18n> = {
  ru: {
    title: "Галерея работ и товаров",
    subtitle:
      "Живые установки, выполненные проекты и актуальные позиции. Открывайте фото, листайте и смотрите детали в полном размере.",
    adminPanel: "Управление галереей",
    add: "Добавить фото",
    save: "Сохранить",
    remove: "Удалить",
    cancel: "Отмена",
    published: "Опубликовано",
    hidden: "Скрыто",
    photoUrl: "URL фото (необязательно)",
    photoFile: "Файл фото",
    titleField: "Название",
    categoryField: "Категория",
    descriptionField: "Описание",
    noItems: "Пока нет фото в галерее.",
    open: "Открыть",
    edit: "Редактировать",
    newItem: "Новое фото",
    editItem: "Редактирование",
    all: "Все",
    close: "Закрыть",
    hint: "В админ-режиме можно быстро добавлять, редактировать и скрывать фотографии прямо со страницы галереи.",
    slide: "Фото",
    createOk: "Фото добавлено.",
    saveOk: "Изменения сохранены.",
    deleteOk: "Фото удалено.",
    confirmDelete: "Удалить фото без возможности восстановления?",
  },
  uk: {
    title: "Галерея робіт і товарів",
    subtitle:
      "Живі монтажі, виконані об'єкти та актуальні позиції. Відкривайте фото, гортайте та дивіться деталі у повному розмірі.",
    adminPanel: "Керування галереєю",
    add: "Додати фото",
    save: "Зберегти",
    remove: "Видалити",
    cancel: "Скасувати",
    published: "Опубліковано",
    hidden: "Приховано",
    photoUrl: "URL фото (необов'язково)",
    photoFile: "Файл фото",
    titleField: "Назва",
    categoryField: "Категорія",
    descriptionField: "Опис",
    noItems: "Поки що немає фото в галереї.",
    open: "Відкрити",
    edit: "Редагувати",
    newItem: "Нове фото",
    editItem: "Редагування",
    all: "Усі",
    close: "Закрити",
    hint: "В адмін-режимі можна швидко додавати, редагувати та приховувати фотографії прямо зі сторінки галереї.",
    slide: "Фото",
    createOk: "Фото додано.",
    saveOk: "Зміни збережено.",
    deleteOk: "Фото видалено.",
    confirmDelete: "Видалити фото без можливості відновлення?",
  },
};

function toDraft(item: GalleryItem): GalleryDraft {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    imageUrl: item.imageUrl,
    category: item.category,
    isPublished: item.isPublished,
  };
}

function sortCategories(items: GalleryItem[]) {
  return [...new Set(items.map((item) => item.category.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function GalleryPageClient({ locale, isAdmin, initialItems }: Props) {
  const t = COPY[locale];
  const [items, setItems] = useState(initialItems);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyCreate, setBusyCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean>(false);
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDraft, setEditDraft] = useState<GalleryDraft | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLImageElement>(null);
  const lightboxInfoRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => sortCategories(items), [items]);
  const activeCategory =
    selectedCategory === "all" || categories.includes(selectedCategory)
      ? selectedCategory
      : "all";

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [activeCategory, items]);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null || visibleItems.length === 0) return current;
          return (current + 1) % visibleItems.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null || visibleItems.length === 0) return current;
          return (current - 1 + visibleItems.length) % visibleItems.length;
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, visibleItems.length]);

  // Lightbox open animation
  useEffect(() => {
    if (activeIndex !== null && lightboxRef.current) {
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );

      if (lightboxImageRef.current) {
        gsap.fromTo(
          lightboxImageRef.current,
          { scale: 0.8, opacity: 0, y: 40 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.4)", delay: 0.1 },
        );
      }

      if (lightboxInfoRef.current) {
        gsap.fromTo(
          lightboxInfoRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.3 },
        );
      }
    }
  }, [activeIndex]);

  // Image transition animation
  useEffect(() => {
    if (lightboxImageRef.current && activeIndex !== null) {
      gsap.fromTo(
        lightboxImageRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [activeIndex]);

  function showMessage(text: string, success: boolean) {
    setMessage(text);
    setOk(success);
  }

  function openLightbox(index: number) {
    setActiveIndex(index);
  }

  function closeLightbox() {
    if (lightboxRef.current) {
      gsap.to(lightboxRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setActiveIndex(null),
      });
    } else {
      setActiveIndex(null);
    }
  }

  function moveLightbox(direction: -1 | 1) {
    if (activeIndex === null || visibleItems.length === 0) return;

    if (lightboxImageRef.current) {
      gsap.to(lightboxImageRef.current, {
        x: direction * -50,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setActiveIndex((activeIndex + direction + visibleItems.length) % visibleItems.length);
        },
      });
    } else {
      setActiveIndex((activeIndex + direction + visibleItems.length) % visibleItems.length);
    }
  }

  function startEdit(item: GalleryItem) {
    setEditDraft(toDraft(item));
    setEditFile(null);
    setMessage(null);
  }

  function cancelEdit() {
    setEditDraft(null);
    setEditFile(null);
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyCreate(true);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = new FormData();
    payload.set("title", String(formData.get("title") ?? ""));
    payload.set("description", String(formData.get("description") ?? ""));
    payload.set("imageUrl", String(formData.get("imageUrl") ?? ""));
    payload.set("category", String(formData.get("category") ?? ""));
    payload.set("isPublished", formData.get("isPublished") === "on" ? "true" : "false");
    if (createFile) payload.set("image", createFile);

    const response = await fetch("/api/admin/gallery", { method: "POST", body: payload });
    const data = (await response.json()) as { ok: boolean; item?: GalleryItem; message?: string };
    setBusyCreate(false);

    if (!response.ok || !data.ok || !data.item) {
      showMessage(data.message ?? "Failed to create gallery item", false);
      return;
    }

    setItems((prev) => [data.item!, ...prev]);
    form.reset();
    setCreateFile(null);
    showMessage(t.createOk, true);
  }

  async function saveItem() {
    if (!editDraft) return;
    setBusyId(editDraft.id);
    setMessage(null);

    const payload = new FormData();
    payload.set("title", editDraft.title);
    payload.set("description", editDraft.description);
    payload.set("imageUrl", editDraft.imageUrl);
    payload.set("category", editDraft.category);
    payload.set("isPublished", editDraft.isPublished ? "true" : "false");
    if (editFile) payload.set("image", editFile);

    const response = await fetch(`/api/admin/gallery/${editDraft.id}`, {
      method: "PATCH",
      body: payload,
    });
    const data = (await response.json()) as { ok: boolean; item?: GalleryItem; message?: string };
    setBusyId(null);

    if (!response.ok || !data.ok || !data.item) {
      showMessage(data.message ?? "Failed to save gallery item", false);
      return;
    }

    setItems((prev) => prev.map((item) => (item.id === editDraft.id ? data.item! : item)));
    setEditDraft(toDraft(data.item));
    setEditFile(null);
    showMessage(t.saveOk, true);
  }

  async function deleteItem(id: string) {
    if (!window.confirm(t.confirmDelete)) return;

    setBusyId(id);
    setMessage(null);
    const response = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    const data = (await response.json()) as { ok: boolean; message?: string };
    setBusyId(null);

    if (!response.ok) {
      showMessage(
        data.message ??
          (locale === "uk" ? "Не вдалося видалити фото." : "Не удалось удалить фото."),
        false,
      );
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editDraft?.id === id) {
      setEditDraft(null);
      setEditFile(null);
    }
    if (activeItem?.id === id) {
      closeLightbox();
    }
    showMessage(t.deleteOk, true);
  }

  const activeItem = activeIndex === null ? null : visibleItems[activeIndex];

  return (
    <main className="container-site py-10">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-[linear-gradient(135deg,#f6faf6_0%,#edf4ef_45%,#e6efe8_100%)] p-6 shadow-[0_25px_70px_rgba(22,47,35,0.08)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Okoshkin Gallery
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
              {t.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              {t.subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="hover-lift rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
              <div className="text-2xl font-semibold">{items.length}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {locale === "uk" ? "фото" : "фото"}
              </div>
            </div>
            <div className="hover-lift rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
              <div className="text-2xl font-semibold">{categories.length || 1}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {locale === "uk" ? "категорії" : "категории"}
              </div>
            </div>
            <div className="hover-lift rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
              <div className="text-2xl font-semibold">
                {items.filter((item) => item.isPublished).length}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {locale === "uk" ? "видимі" : "видимые"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <p
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm smooth-appear ${
            ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      {isAdmin && (
        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel-enhanced rounded-[1.75rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              {t.adminPanel}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{t.newItem}</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t.hint}</p>

            <form className="mt-5 grid gap-3" onSubmit={createItem}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  name="title"
                  placeholder={t.titleField}
                  className="input-shell"
                />
                <input
                  required
                  name="category"
                  placeholder={t.categoryField}
                  className="input-shell"
                />
              </div>
              <input
                name="imageUrl"
                placeholder={t.photoUrl}
                className="input-shell"
              />
              <label className="grid gap-2 rounded-2xl border border-dashed border-[var(--line-soft)] bg-[var(--brand-soft)]/40 p-4 text-sm transition-all duration-300 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/60">
                <span className="font-medium">{t.photoFile}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setCreateFile(event.target.files?.[0] ?? null)}
                  className="input-shell"
                />
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder={t.descriptionField}
                className="input-shell resize-none"
              />
              <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <input type="checkbox" name="isPublished" defaultChecked />
                {t.published}
              </label>
              <button
                type="submit"
                disabled={busyCreate}
                className="btn-shimmer rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-[var(--brand-strong)] hover:translate-y-[-1px] hover:shadow-[0_12px_24px_rgba(47,122,87,0.24)] disabled:opacity-60"
              >
                {t.add}
              </button>
            </form>
          </div>

          <div className="glass-panel-enhanced rounded-[1.75rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              {t.editItem}
            </p>
            {editDraft ? (
              <div className="mt-3 grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={editDraft.title}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, title: event.target.value } : current,
                      )
                    }
                    className="input-shell"
                  />
                  <input
                    value={editDraft.category}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, category: event.target.value } : current,
                      )
                    }
                    className="input-shell"
                  />
                </div>
                <input
                  value={editDraft.imageUrl}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current ? { ...current, imageUrl: event.target.value } : current,
                    )
                  }
                  className="input-shell"
                />
                <label className="grid gap-2 rounded-2xl border border-dashed border-[var(--line-soft)] bg-[var(--brand-soft)]/40 p-4 text-sm transition-all duration-300 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/60">
                  <span className="font-medium">{t.photoFile}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setEditFile(event.target.files?.[0] ?? null)}
                    className="input-shell"
                  />
                </label>
                <textarea
                  rows={4}
                  value={editDraft.description}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current ? { ...current, description: event.target.value } : current,
                    )
                  }
                  className="input-shell resize-none"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <input
                    type="checkbox"
                    checked={editDraft.isPublished}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, isPublished: event.target.checked } : current,
                      )
                    }
                  />
                  {t.published}
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={saveItem}
                    disabled={busyId === editDraft.id}
                    className="btn-shimmer rounded-xl bg-[var(--brand)] px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-[var(--brand-strong)] hover:translate-y-[-1px] disabled:opacity-60"
                  >
                    {t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(editDraft.id)}
                    disabled={busyId === editDraft.id}
                    className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700 transition-all duration-300 hover:bg-red-50 hover:border-red-400 disabled:opacity-60"
                  >
                    {t.remove}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-xl border border-[var(--line-soft)] px-5 py-3 font-semibold transition-all duration-300 hover:bg-white hover:border-[var(--brand)]"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[var(--line-soft)] bg-[var(--brand-soft)]/30 p-6 text-sm text-[var(--text-muted)]">
                {locale === "uk"
                  ? "Оберіть фото в сітці нижче, щоб відредагувати його параметри."
                  : "Выберите фото в сетке ниже, чтобы отредактировать его параметры."}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
              activeCategory === "all"
                ? "bg-[var(--brand)] text-white shadow-[0_8px_16px_rgba(47,122,87,0.24)]"
                : "border border-[var(--line-soft)] bg-white text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            }`}
          >
            {t.all}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                activeCategory === category
                  ? "bg-[var(--brand)] text-white shadow-[0_8px_16px_rgba(47,122,87,0.24)]"
                  : "border border-[var(--line-soft)] bg-white text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm text-[var(--text-muted)]">
            {t.noItems}
          </p>
        ) : (
          <div className="mt-6 grid auto-rows-[170px] gap-4 md:grid-cols-12">
            {visibleItems.map((item, index) => {
              const cardClass =
                index === 0
                  ? "md:col-span-7 md:row-span-2"
                  : index === 1 || index === 2
                    ? "md:col-span-5"
                    : "md:col-span-4";

              return (
                <article
                  key={item.id}
                  className={`group relative overflow-hidden rounded-[1.75rem] border border-[var(--line-soft)] bg-[#dbe7df] shadow-[0_18px_40px_rgba(18,39,29,0.08)] transition-all duration-500 hover:shadow-[0_28px_56px_rgba(18,39,29,0.14)] ${cardClass}`}
                >
                  <button type="button" onClick={() => openLightbox(index)} className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
                    />
                  </button>

                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(13,25,19,0.04)_0%,rgba(13,25,19,0.18)_36%,rgba(13,25,19,0.78)_100%)] transition-opacity duration-500 group-hover:opacity-90" />

                  <div className="absolute inset-x-0 bottom-0 p-4 text-white transition-transform duration-500 group-hover:translate-y-[-4px]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                          {item.category}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                        {item.description && (
                          <p className="mt-2 max-w-xl text-sm leading-6 text-white/78">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!item.isPublished && isAdmin && (
                          <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/85">
                            {t.hidden}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openLightbox(index)}
                          className="pointer-events-auto rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-all duration-300 hover:bg-white/25 hover:scale-105"
                        >
                          {t.open}
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="pointer-events-auto rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-all duration-300 hover:bg-white/25 hover:scale-105"
                            >
                              {t.edit}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              disabled={busyId === item.id}
                              className="pointer-events-auto rounded-full border border-red-200/40 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-all duration-300 hover:bg-red-500/35 hover:scale-105 disabled:opacity-60"
                            >
                              {t.remove}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {activeItem && (
        <div ref={lightboxRef} className="fixed inset-0 z-50 bg-[rgba(8,16,12,0.92)] backdrop-blur-lg">
          <button type="button" onClick={closeLightbox} className="absolute inset-0" aria-label={t.close} />

          <div className="relative flex h-full items-center justify-center px-4 py-6 sm:px-8">
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-105 sm:right-8 sm:top-8"
            >
              {t.close}
            </button>

            <button
              type="button"
              onClick={() => moveLightbox(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:left-6"
              aria-label={t.open}
            >
              ‹
            </button>

            <div className="relative w-full max-w-6xl">
              <div ref={lightboxImageRef} className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="max-h-[74vh] w-full object-contain"
                />
              </div>

              <div ref={lightboxInfoRef} className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    {activeItem.category}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{activeItem.title}</h2>
                  {activeItem.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                      {activeItem.description}
                    </p>
                  )}
                </div>
                <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85">
                  {t.slide} {(activeIndex ?? 0) + 1} / {visibleItems.length}
                </div>
              </div>

              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {visibleItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                      index === activeIndex
                        ? "border-white/80 ring-2 ring-white/40 scale-105"
                        : "border-white/10 opacity-60 hover:opacity-90 hover:scale-105"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => moveLightbox(1)}
              className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl text-white backdrop-blur transition-all duration-300 hover:bg-white/20 hover:scale-110 sm:right-6"
              aria-label={t.open}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
