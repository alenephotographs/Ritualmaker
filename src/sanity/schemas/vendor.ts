import { defineField, defineType } from "sanity";

export default defineType({
  name: "vendor",
  title: "Vendor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Vendor name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "contactName",
      title: "Contact name",
      type: "string",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "accessCode",
      title: "Admin access code",
      type: "string",
      description:
        "Used for vendor admin login (email + access code). Keep this private.",
      validation: (rule) => rule.min(6),
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "stripeAccountId",
      title: "Stripe connected account ID",
      type: "string",
      description: "Stored after Stripe Connect onboarding.",
    }),
    defineField({
      name: "stripeOnboardingComplete",
      title: "Stripe onboarding complete",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "stripeDetailsSubmitted",
      title: "Stripe details submitted",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "stripeChargesEnabled",
      title: "Stripe charges enabled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "stripePayoutsEnabled",
      title: "Stripe payouts enabled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "stripeRequirementsCurrentlyDue",
      title: "Stripe requirements currently due",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Stripe fields currently required (often includes tax and payout documents).",
    }),
    defineField({
      name: "stripeRequirementsPastDue",
      title: "Stripe requirements past due",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "stripeRequirementsDisabledReason",
      title: "Stripe requirements disabled reason",
      type: "string",
    }),
    defineField({
      name: "stripeComplianceLastSyncedAt",
      title: "Stripe compliance last synced at",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "contactEmail",
      active: "active",
      due: "stripeRequirementsCurrentlyDue",
    },
    prepare({ title, subtitle, active, due }) {
      const dueCount = Array.isArray(due) ? due.length : 0;
      const parts = [
        subtitle,
        active === false ? "INACTIVE" : "",
        dueCount > 0 ? `${dueCount} DUE` : "",
      ].filter(Boolean);
      return { title, subtitle: parts.join(" · ") };
    },
  },
});
