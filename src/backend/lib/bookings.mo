import Types "../types/bookings";
import List "mo:core/List";

module {
  public type Booking = Types.Booking;

  public func add(
    bookings : List.List<Booking>,
    state : { var nextId : Nat },
    name : Text,
    phone : Text,
    issue : Text,
    slotTime : Text,
    date : Text,
  ) : Nat {
    let id = state.nextId;
    state.nextId += 1;
    bookings.add({ id; name; phone; issue; slotTime; date });
    id;
  };

  public func getAll(bookings : List.List<Booking>) : [Booking] {
    bookings.toArray();
  };

  public func getBookedSlots(bookings : List.List<Booking>, date : Text) : [Text] {
    let slots = List.empty<Text>();
    bookings.forEach(func(b) {
      if (b.date == date) { slots.add(b.slotTime) };
    });
    slots.toArray();
  };
};
