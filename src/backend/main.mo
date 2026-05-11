import List "mo:core/List";
import Types "types/bookings";
import BookingsApi "mixins/bookings-api";

actor {
  let bookings = List.empty<Types.Booking>();
  let state = { var nextId : Nat = 0 };
  include BookingsApi(bookings, state);
};

