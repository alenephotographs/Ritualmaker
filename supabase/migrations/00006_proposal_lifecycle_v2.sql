-- Expand proposal_lifecycle_status for Events & Proposals workflow.
-- Migrate legacy "archived" (disabled link) to "cancelled".

update public.client_documents
set proposal_lifecycle_status = 'cancelled'
where proposal_lifecycle_status = 'archived';

alter table public.client_documents
  drop constraint if exists client_documents_proposal_lifecycle_status_check;

alter table public.client_documents
  add constraint client_documents_proposal_lifecycle_status_check
    check (
      proposal_lifecycle_status in (
        'draft',
        'sent',
        'viewed',
        'approved',
        'balance_due',
        'deposit_paid',
        'partially_paid',
        'paid_in_full',
        'completed',
        'cancelled'
      )
    );
