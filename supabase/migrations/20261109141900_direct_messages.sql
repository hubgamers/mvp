CREATE TABLE "direct_conversations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user1_id" UUID NOT NULL,
  "user2_id" UUID NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "direct_conversations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "direct_conversations_distinct_users" CHECK ("user1_id" < "user2_id"),
  CONSTRAINT "direct_conversations_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "direct_conversations_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX "direct_conversations_user1_id_user2_id_key"
  ON "direct_conversations"("user1_id", "user2_id");

CREATE INDEX "direct_conversations_user2_id_updated_at_idx"
  ON "direct_conversations"("user2_id", "updated_at");

CREATE TABLE "direct_messages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL,
  "sender_id" UUID NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "direct_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "direct_conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX "direct_messages_conversation_id_created_at_idx"
  ON "direct_messages"("conversation_id", "created_at");

ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read direct conversations"
  ON public.direct_conversations
  FOR SELECT
  USING (
    user1_id = public.current_user_id()
    OR user2_id = public.current_user_id()
  );

CREATE POLICY "Participants can create direct conversations"
  ON public.direct_conversations
  FOR INSERT
  WITH CHECK (
    user1_id = public.current_user_id()
    OR user2_id = public.current_user_id()
  );

CREATE POLICY "Participants can read direct messages"
  ON public.direct_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.direct_conversations
      WHERE direct_conversations.id = direct_messages.conversation_id
        AND (
          direct_conversations.user1_id = public.current_user_id()
          OR direct_conversations.user2_id = public.current_user_id()
        )
    )
  );

CREATE POLICY "Participants can send direct messages"
  ON public.direct_messages
  FOR INSERT
  WITH CHECK (
    sender_id = public.current_user_id()
    AND EXISTS (
      SELECT 1
      FROM public.direct_conversations
      WHERE direct_conversations.id = direct_messages.conversation_id
        AND (
          direct_conversations.user1_id = public.current_user_id()
          OR direct_conversations.user2_id = public.current_user_id()
        )
    )
  );
