-- Custom SQL migration file, put you code below! --
ALTER TABLE cards
DROP CONSTRAINT cards_card_type_id_card_types_id_fk;


ALTER TABLE card_types
ALTER COLUMN id TYPE text USING id::text;


ALTER TABLE cards
ALTER COLUMN card_type_id TYPE text USING card_type_id::text;


ALTER TABLE cards
ADD CONSTRAINT cards_card_type_id_card_types_id_fk FOREIGN KEY (card_type_id) REFERENCES card_types (id);