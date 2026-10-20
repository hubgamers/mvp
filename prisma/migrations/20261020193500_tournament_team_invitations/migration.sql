ALTER TABLE public.invitations
  ADD COLUMN team_id uuid,
  ADD CONSTRAINT invitations_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES public.teams(id)
    ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE INDEX invitations_team_status_idx
  ON public.invitations(team_id, status);
