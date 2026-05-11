import List "mo:core/List";
import Types "../types/bookings";
import BookingsLib "../lib/bookings";

mixin (
  bookings : List.List<Types.Booking>,
  state : { var nextId : Nat },
) {
  public func addBooking(
    name : Text,
    phone : Text,
    issue : Text,
    slotTime : Text,
    date : Text,
  ) : async Nat {
    BookingsLib.add(bookings, state, name, phone, issue, slotTime, date);
  };

  public query func getBookings() : async [Types.Booking] {
    BookingsLib.getAll(bookings);
  };

  public query func getBookedSlots(date : Text) : async [Text] {
    BookingsLib.getBookedSlots(bookings, date);
  };
};
