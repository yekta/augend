-- Custom SQL migration file, put your code below! --
CREATE
OR REPLACE FUNCTION increment_card_type_counters () RETURNS TRIGGER AS $$
BEGIN
  -- Increment both counters in card_types for the associated card_type_id
  UPDATE card_types
  SET 
    alltime_counter = alltime_counter + 1,
    current_counter = current_counter + 1
  WHERE id = NEW.card_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER increment_card_type_counters_trigger
AFTER INSERT ON cards FOR EACH ROW
EXECUTE FUNCTION increment_card_type_counters ();


CREATE
OR REPLACE FUNCTION decrement_card_type_current_counter () RETURNS TRIGGER AS $$
BEGIN
  -- Decrement current_counter in card_types for the associated card_type_id
  UPDATE card_types
  SET current_counter = current_counter - 1
  WHERE id = OLD.card_type_id AND current_counter > 0;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER decrement_card_type_current_counter_trigger
AFTER DELETE ON cards FOR EACH ROW
EXECUTE FUNCTION decrement_card_type_current_counter ();