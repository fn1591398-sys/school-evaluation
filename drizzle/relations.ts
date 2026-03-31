import { relations } from "drizzle-orm";
import { criteria, domains, evidences, indicators } from "./schema";

export const domainsRelations = relations(domains, ({ many }) => ({
  criteria: many(criteria),
}));

export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  domain: one(domains, {
    fields: [criteria.domainId],
    references: [domains.id],
  }),
  indicators: many(indicators),
}));

export const indicatorsRelations = relations(indicators, ({ one, many }) => ({
  criteria: one(criteria, {
    fields: [indicators.criteriaId],
    references: [criteria.id],
  }),
  evidences: many(evidences),
}));

export const evidencesRelations = relations(evidences, ({ one }) => ({
  indicator: one(indicators, {
    fields: [evidences.indicatorId],
    references: [indicators.id],
  }),
}));
