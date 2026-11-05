"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, startTransition } from "react";
import {
  submitRepairRequest,
  type RepairRequestState,
} from "@/app/actions/repair-request";
import { StateSelect } from "@/components/ui/StateSelect";
import { PinCodeInput } from "@/components/ui/PinCodeInput";
import { Field } from "@/components/ui/Field";
import { PHONE_INPUT } from "@/lib/utils/phone";
import { EMAIL_INPUT } from "@/lib/utils/email";
import { ALL_WORK_TYPES } from "@/lib/utils/limits";
import { Panel } from "@/components/ui/Panel";
import { PillRadioGroup, PillRadio } from "@/components/ui/PillRadio";
import {
  sniffBoundedImageFile,
  CUSTOMER_IMAGE_ACCEPT,
  BOUNDED_IMAGE_TYPES_MESSAGE,
} from "@/lib/images/validation";

export type AddressDTO = {
  id: string;
  label: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

type NewPhoto = { uid: string; url: string; file: File };

const SERVICE_CARDS = [
  {
    id: "custom",
    submit: "custom",
    title: "Custom Work",
    desc: "Build, modify, tune, or customize your keyboard.",
  },
  {
    id: "repair",
    submit: "repair",
    title: "Repair",
    desc: "Diagnose and repair keyboards, mice, PCBs, and electronics.",
  },
  {
    id: "modification",
    submit: "custom",
    title: "Modification",
    desc: "Upgrade switches, stabilizers, firmware, or the case.",
  },
  {
    id: "restoration",
    submit: "repair",
    title: "Restoration",
    desc: "Bring an old or damaged board back to life.",
  },
  {
    id: "unsure",
    submit: "unsure",
    title: "Not sure",
    desc: "Describe the problem and we'll help determine the right service.",
  },
] as const;

type ServiceType = (typeof SERVICE_CARDS)[number]["id"];

const CONDITIONS = [
  "Working but has issues",
  "Partially working",
  "Not powering on",
  "Cosmetic only",
  "Brand new (parts only)",
  "Other",
];
const DEVICES = [
  { id: "KEYBOARD", label: "Keyboard" },
  { id: "MOUSE", label: "Mouse" },
  { id: "OTHER", label: "Other Electronics" },
];
const SHIPPING = [
  { id: "SHIP", label: "I'll ship the device" },
  { id: "PICKUP", label: "Need a pickup" },
  { id: "UNSURE", label: "Not sure" },
];

const WORK_OPTIONS = (() => {
  const sorted = [...ALL_WORK_TYPES].sort((a, b) => a.localeCompare(b));
  // keep "Other" pinned to the end
  const i = sorted.indexOf("Other");
  return i === -1
    ? sorted
    : [...sorted.slice(0, i), ...sorted.slice(i + 1), "Other"];
})();

export function RepairIntake({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState<
    RepairRequestState,
    FormData
  >(submitRepairRequest, {});
  const [phase, setPhase] = useState<"form" | "review">("form");

  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [deviceType, setDeviceType] = useState("KEYBOARD");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [otherWork, setOtherWork] = useState("");
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const defaultNameParts = defaults.name.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(defaultNameParts[0] ?? "");
  const [lastName, setLastName] = useState(defaultNameParts.slice(1).join(" "));
  const [email, setEmail] = useState(defaults.email);
  const [phone, setPhone] = useState(defaults.phone);
  const [contactNotes, setContactNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState("SHIP");
  const [useAddressId, setUseAddressId] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state_, setState_] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [gateError, setGateError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<NewPhoto[]>([]);

  // ponytail: saved addresses are only needed to prefill the shipping/pickup
  // section (a later, non-critical step), so fetch them client-side after
  // mount instead of making the server render wait (removes 1 blocking DB RT).
  useEffect(() => {
    let alive = true;
    fetch("/api/account/addresses")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!alive || !Array.isArray(list)) return;
        const items: AddressDTO[] = list.map((a) => ({
          id: a.id,
          label: a.label,
          streetAddress: a.streetAddress,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          isDefault: a.isDefault,
        }));
        setAddresses(items);
        // Match the old server-passed behaviour: pre-select the saved default.
        if (items.length > 0) {
          const def = items.find((x) => x.isDefault) ?? items[0];
          setUseAddressId(def.id);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setAddressesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const room = MAX_PHOTOS - photos.length;
    const accepted: NewPhoto[] = [];
    for (const f of files.slice(0, room)) {
      if (f.size > MAX_PHOTO_BYTES) {
        alert(`Each photo must be under 3 MB — "${f.name}" is too large.`);
        continue;
      }
      if (!(await sniffBoundedImageFile(f))) {
        alert(`${BOUNDED_IMAGE_TYPES_MESSAGE} ("${f.name}" isn't one.)`);
        continue;
      }
      accepted.push({
        uid: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(f),
        file: f,
      });
    }
    if (accepted.length < files.length)
      alert(`You can attach at most ${MAX_PHOTOS} photos.`);
    setPhotos((prev) => [...prev, ...accepted]);
    e.target.value = "";
  }

  function dropPhoto(uid: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.uid === uid);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((p) => p.uid !== uid);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    for (const p of photos) fd.append("photos", p.file);
    startTransition(() => formAction(fd));
  }

  const missing: string[] = [];
  if (!serviceType) missing.push("a service type");
  if (!brand.trim()) missing.push("the brand");
  if (model.trim().length < 2) missing.push("the model / PCB");
  if (workTypes.length === 0) missing.push("at least one work type");
  if (description.trim().length < 20)
    missing.push("a description (20+ characters)");
  if (firstName.trim().length < 1 || lastName.trim().length < 1)
    missing.push("your first and last name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
    missing.push("a valid email");
  if (phone.trim().length < 10) missing.push("a valid phone number");
  if (
    shippingMethod !== "UNSURE" &&
    !useAddressId &&
    (!street.trim() ||
      !city.trim() ||
      !state_.trim() ||
      !/^\d{6}$/.test(postalCode.trim()))
  )
    missing.push("the full pickup address");

  const goReview = () => {
    if (missing.length > 0) {
      setGateError(`Please add ${missing.join(", ")} before continuing.`);
      return;
    }
    setGateError(null);
    setPhase("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (state.ok && state.orderNumber) {
    return (
      <div className="ri-done panel">
        <div className="ri-done-badge" aria-hidden="true">
          ✓
        </div>
        <h2 className="ri-done-title">Request Received</h2>
        <p className="ri-done-text">
          We&apos;ve received your request. We&apos;ll review the details and
          get back to you with the next steps. Final price will be confirmed
          after inspection.
        </p>
        <p className="ri-ref">
          Reference <strong>{state.orderNumber}</strong>
        </p>
        <div className="ri-done-actions">
          <Link
            href={`/order/success/${state.orderNumber}`}
            className="btn-prime"
          >
            View Request
          </Link>
          <Link href="/" className="btn-ghost">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const serviceOption = SERVICE_CARDS.find((s) => s.id === serviceType);
  const serviceLabel = serviceOption?.title ?? "—";
  const serviceSubmit = serviceOption?.submit ?? "";
  const deviceLabel = DEVICES.find((d) => d.id === deviceType)?.label ?? "—";
  const shipLabel = SHIPPING.find((s) => s.id === shippingMethod)?.label ?? "—";
  const selectedAddress = addresses.find((a) => a.id === useAddressId) ?? null;

  const workLabel =
    workTypes.length === 0
      ? "—"
      : workTypes
          .map((w) =>
            w === "Other" && otherWork.trim()
              ? `Other — ${otherWork.trim()}`
              : w,
          )
          .join(", ");

  const descriptionForSubmit =
    workTypes[0] === "Other" && otherWork.trim()
      ? `${description.trim()}${description.trim() ? "\n\n" : ""}Other work: ${otherWork.trim()}`
      : description;

  const summaryRows: Array<[string, string]> = [
    ["Service", serviceLabel],
    ["Device", deviceLabel],
    ["Work", workLabel],
    ["Photos", photos.length > 0 ? `${photos.length} attached` : "—"],
    [shippingMethod === "PICKUP" ? "Pickup" : "Shipping", shipLabel],
  ];

  const shippingMethodField = (
    <Field label="How will you get the device to us?" htmlFor="ri-shipping">
      <select
        id="ri-shipping"
        value={shippingMethod}
        onChange={(e) => setShippingMethod(e.target.value)}
      >
        {SHIPPING.map((sm) => (
          <option key={sm.id} value={sm.id}>
            {sm.label}
          </option>
        ))}
      </select>
    </Field>
  );

  const shippingAddressBlock = (
    <>
      {(shippingMethod === "SHIP" || shippingMethod === "PICKUP") && (
        <div className="ri-address-block">
          {addressesLoading ? (
            <div
              className="skeleton"
              style={{ height: 120, borderRadius: "var(--r-md)" }}
            />
          ) : addresses.length > 0 ? (
            <div className="ri-address-list">
              {[...addresses, null].map((a) =>
                a ? (
                  <label
                    key={a.id}
                    className={`ri-address${useAddressId === a.id ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="addrPick"
                      checked={useAddressId === a.id}
                      onChange={() => setUseAddressId(a.id)}
                    />
                    <span>
                      <strong>
                        {a.label}
                        {a.isDefault ? " · Default" : ""}
                      </strong>
                      {a.streetAddress}, {a.city}, {a.state} {a.postalCode}
                    </span>
                  </label>
                ) : (
                  <label
                    key="new"
                    className={`ri-address${useAddressId === "" ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="addrPick"
                      checked={useAddressId === ""}
                      onChange={() => setUseAddressId("")}
                    />
                    <span>
                      <strong>Use a different address</strong>
                    </span>
                  </label>
                ),
              )}
              {useAddressId === "" && (
                <div className="ri-address-manual">
                  <Field label="Street address" htmlFor="ri-street">
                    <input
                      id="ri-street"
                      maxLength={200}
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      autoComplete="street-address"
                      placeholder="House, street…"
                    />
                  </Field>
                  <Field label="Landmark (Optional)" htmlFor="ri-landmark">
                    <input
                      id="ri-landmark"
                      maxLength={200}
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Near metro station, opposite park…"
                    />
                  </Field>
                  <div className="addr-city-row">
                    <Field label="City" htmlFor="ri-city">
                      <input
                        id="ri-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="State" htmlFor="ri-state-in">
                      <StateSelect
                        id="ri-state-in"
                        value={state_}
                        onChange={(v) => setState_(v)}
                        autoComplete="address-level1"
                        placeholder="Select state…"
                      />
                    </Field>
                    <Field label="PIN Code" htmlFor="ri-pin">
                      <PinCodeInput
                        id="ri-pin"
                        value={postalCode}
                        onChange={(v) => setPostalCode(v)}
                        autoComplete="postal-code"
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ri-address-manual">
              <Field label="Street address" htmlFor="ri-street">
                <input
                  id="ri-street"
                  maxLength={200}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  autoComplete="street-address"
                  placeholder="House, street…"
                />
              </Field>
              <Field label="Landmark (Optional)" htmlFor="ri-landmark">
                <input
                  id="ri-landmark"
                  maxLength={200}
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near metro station, opposite park…"
                />
              </Field>
              <div className="addr-city-row">
                <Field label="City" htmlFor="ri-city">
                  <input
                    id="ri-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field label="State" htmlFor="ri-state-in">
                  <StateSelect
                    id="ri-state-in"
                    value={state_}
                    onChange={(v) => setState_(v)}
                    autoComplete="address-level1"
                    placeholder="Select state…"
                  />
                </Field>
                <Field label="PIN Code" htmlFor="ri-pin">
                  <PinCodeInput
                    id="ri-pin"
                    value={postalCode}
                    onChange={(v) => setPostalCode(v)}
                    autoComplete="postal-code"
                  />
                </Field>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      className="ri-layout ri2-layout"
    >
      <input type="hidden" name="serviceType" value={serviceSubmit} />
      <input type="hidden" name="deviceType" value={deviceType} />
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="firstName" value={firstName} />
      <input type="hidden" name="lastName" value={lastName} />
      {workTypes.map((w) => (
        <input key={w} type="hidden" name="workTypes" value={w} />
      ))}
      <input type="hidden" name="condition" value={condition} />
      <input type="hidden" name="budget" value={budget} />
      <input
        type="hidden"
        name="description"
        value={descriptionForSubmit}
      />
      <input type="hidden" name="phone" value={phone} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="contactNotes" value={contactNotes} />
      <input type="hidden" name="shippingMethod" value={shippingMethod} />
      <input type="hidden" name="useAddressId" value={useAddressId} />
      <input type="hidden" name="street" value={street} />
      <input type="hidden" name="landmark" value={landmark} />
      <input type="hidden" name="city" value={city} />
      <input type="hidden" name="state" value={state_} />
      <input type="hidden" name="postalCode" value={postalCode} />

      <div className="ri-main ri2-main">
        {phase === "review" ? (
          <Panel
            tag="Final Check"
            title="Review Your Request"
            className="panel ri2-card"
          >
            <dl className="ri-review-grid ri2-review-grid">
              <div>
                <dt>Service type</dt>
                <dd>{serviceLabel}</dd>
              </div>
              <div>
                <dt>Device</dt>
                <dd>{deviceLabel}</dd>
              </div>
              <div>
                <dt>Brand</dt>
                <dd>{brand}</dd>
              </div>
              <div>
                <dt>Model / PCB</dt>
                <dd>{model}</dd>
              </div>
              <div className="ri-span">
                <dt>Requested work</dt>
                <dd>{workLabel}</dd>
              </div>
              <div className="ri-span">
                <dt>Description</dt>
                <dd className="ri2-review-desc">{descriptionForSubmit}</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>{condition}</dd>
              </div>
              <div>
                <dt>Budget estimate</dt>
                <dd>{budget.trim() || "—"}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{`${firstName} ${lastName}`.trim()}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt>WhatsApp / Phone</dt>
                <dd>{phone}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{shipLabel}</dd>
              </div>
              {shippingMethod !== "UNSURE" && (
                <div className="ri-span">
                  <dt>
                    {shippingMethod === "SHIP"
                      ? "Shipping address"
                      : "Pickup address"}
                  </dt>
                  <dd>
                    {selectedAddress
                      ? `${selectedAddress.streetAddress}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postalCode}`
                      : `${street}${landmark ? `, ${landmark}` : ""}, ${city}, ${state_} ${postalCode}`}
                  </dd>
                </div>
              )}
            </dl>
            {(state.error || gateError) && (
              <p role="alert" className="ri-error">
                {state.error ?? gateError}
              </p>
            )}
            <div className="ri-review-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setPhase("form")}
              >
                Edit Request
              </button>
            </div>
          </Panel>
        ) : (
          <>
            {/* REQUEST DETAILS — service, logistics, device & project */}
            <Panel
              tag="Request Details"
              title="Tell us about the project"
              className="panel ri2-card"
            >
              <div className="ri2-form-sections">
                <section className="ri2-section">
                  <p className="ri2-section-label">01 — Service</p>
                  <h3 className="ri2-section-title">
                    What are you looking for?
                  </h3>
                  <div className="ri2-section-fields">
                    <Field label="Service type" htmlFor="ri-service">
                      <select
                        id="ri-service"
                        value={serviceType ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setServiceType(v ? (v as ServiceType) : null);
                        }}
                      >
                        <option value="" disabled>
                          Select a service…
                        </option>
                        {SERVICE_CARDS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="What do you need done?" htmlFor="ri-work">
                      <select
                        id="ri-work"
                        value={workTypes[0] ?? ""}
                        onChange={(e) =>
                          setWorkTypes(e.target.value ? [e.target.value] : [])
                        }
                      >
                        <option value="" disabled>
                          Select work required…
                        </option>
                        {WORK_OPTIONS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {workTypes[0] === "Other" && (
                      <Field
                        label="Tell us about the work"
                        htmlFor="ri-work-other"
                      >
                        <input
                          id="ri-work-other"
                          value={otherWork}
                          onChange={(e) => setOtherWork(e.target.value)}
                          placeholder="Describe the work you need…"
                          maxLength={200}
                        />
                      </Field>
                    )}
                  </div>
                </section>

                <section className="ri2-section">
                  {shippingMethodField}
                </section>

                <section className="ri2-section">
                  <p className="ri2-section-label">02 — Device</p>
                  <h3 className="ri2-section-title">
                    What are you working on?
                  </h3>
                  <div className="ri2-section-fields">
                    <Field label="Device type">
                      <PillRadioGroup size="lg">
                        {DEVICES.map((dv) => (
                          <PillRadio
                            key={dv.id}
                            name="deviceTypeRadio"
                            value={dv.id}
                            label={dv.label}
                            checked={deviceType === dv.id}
                            onChange={() => setDeviceType(dv.id)}
                          />
                        ))}
                      </PillRadioGroup>
                    </Field>
                    <div className="ri-field-row ri2-row">
                      <Field label="Brand" htmlFor="ri-brand">
                        <input
                          id="ri-brand"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="e.g. Keychron, Logitech…"
                        />
                      </Field>
                      <Field label="Model / PCB" htmlFor="ri-model">
                        <input
                          id="ri-model"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          placeholder="e.g. K2, G Pro X, custom PCB rev…"
                        />
                      </Field>
                    </div>
                  </div>
                </section>

                <section className="ri2-section">
                  <p className="ri2-section-label">03 — Condition</p>
                  <div className="ri2-section-fields">
                    <div className="kf-field">
                      <label htmlFor="ri-condition" className="sr-only">
                        Current condition
                      </label>
                      <select
                        id="ri-condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="ri2-section">
                  <p className="ri2-section-label">04 — Description</p>
                  <div className="ri2-section-fields">
                    <div className="kf-field">
                      <label htmlFor="ri-desc" className="sr-only">
                        Description
                      </label>
                      <textarea
                        id="ri-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the job — what's happening, what you want achieved, history of the device…"
                        minLength={20}
                      />
                    </div>
                  </div>
                </section>

                <section className="ri2-section">
                  <p className="ri2-section-label">05 — Photos (optional)</p>
                  <div className="kf-field">
                    <p className="field-hint">
                      Show us the damage, layout, or parts you want worked on.
                    </p>
                    <div className="wr-photo-grid ri2-photo-grid">
                      {photos.map((p) => (
                        <div key={p.uid} className="wr-photo">
                          <img src={p.url} alt="" width={120} height={90} />
                          <button
                            type="button"
                            className="wr-photo-x"
                            onClick={() => dropPhoto(p.uid)}
                            aria-label="Remove photo"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {photos.length < MAX_PHOTOS && (
                        <label className="wr-photo-add">
                          <input
                            type="file"
                            accept={CUSTOMER_IMAGE_ACCEPT.join(",")}
                            multiple
                            onChange={onFilesChange}
                            className="sr-only"
                          />
                          <span className="wr-photo-add-icon">+</span>
                          <span>Add Photos</span>
                        </label>
                      )}
                    </div>
                    <p className="field-hint">
                      PNG / JPG / WebP · Up to {MAX_PHOTOS} photos · Max 3 MB
                      each
                    </p>
                  </div>
                </section>

                <section className="ri2-section">
                  <p className="ri2-section-label">
                    06 — Estimated Budget (optional)
                  </p>
                  <div className="kf-field">
                    <label htmlFor="ri-budget" className="sr-only">
                      Estimated budget (optional)
                    </label>
                    <input
                      id="ri-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹2,000–5,000"
                    />
                  </div>
                </section>
              </div>
            </Panel>

            {/* 03 — CONTACT */}
            <Panel
              tag="Contact"
              title="Your Details"
              className="panel ri2-card"
            >
              <div className="field-stack ri2-stack">
                <div className="ri-field-row ri2-row">
                  <Field label="First Name" htmlFor="ri-first-name">
                    <input
                      id="ri-first-name"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      placeholder="Your first name"
                    />
                  </Field>
                  <Field label="Last Name" htmlFor="ri-last-name">
                    <input
                      id="ri-last-name"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      placeholder="Your last name"
                    />
                  </Field>
                </div>
                <div className="ri-field-row ri2-row">
                  <Field label="WhatsApp / Phone" htmlFor="ri-phone">
                    <input
                      id="ri-phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder="9876543210"
                      {...PHONE_INPUT}
                    />
                  </Field>
                  <Field label="Email" htmlFor="ri-email">
                    <input
                      id="ri-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="your@email.com"
                      {...EMAIL_INPUT}
                    />
                  </Field>
                </div>
                <Field
                  label="Additional contact info (optional)"
                  htmlFor="ri-notes"
                >
                  <input
                    id="ri-notes"
                    value={contactNotes}
                    onChange={(e) => setContactNotes(e.target.value)}
                    placeholder="Discord, Telegram, alternate number…"
                  />
                </Field>

                {shippingAddressBlock}
              </div>
            </Panel>

          </>
        )}
      </div>

      <aside className="ri-side ri2-side">
        <Panel
          tag="Request Summary"
          title="Your Request"
          className="panel ri2-summary-card"
        >
          <dl className="ri-summary-list ri2-summary-list">
            {summaryRows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ri2-quote">
            We&apos;ll confirm the final price after inspection.
          </p>
          {gateError && phase === "form" && (
            <p role="alert" className="ri-error">
              {gateError}
            </p>
          )}
          {phase === "form" ? (
            <button
              type="button"
              className="btn-prime ri2-submit"
              onClick={goReview}
              disabled={pending}
            >
              Review Request <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button
              type="submit"
              className="btn-prime ri2-submit"
              disabled={pending}
            >
              {pending ? (
                "Submitting…"
              ) : (
                <>
                  Submit Request <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          )}
          <p className="ri-side-hint ri2-side-hint">
            Mail-in service across India
          </p>
        </Panel>
      </aside>
    </form>
  );
}
