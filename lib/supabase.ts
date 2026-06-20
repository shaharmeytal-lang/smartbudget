import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://rgrkroklxnecgzacspym.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJncmtyb2tseG5lY2d6YWNzcHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MTk3MzYsImV4cCI6MjA5NzQ5NTczNn0.2L0ja2XKzIryWp8_ElsdarnDkVoTpZmYJIBQvNtcFL0"
);