using FluentValidation;
using Event_Planning_Platform.Models.Dtos;

namespace Event_Planning_Platform.Validators
{
    public class EventDtoValidator : AbstractValidator<EventDto>
    {
        public EventDtoValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required.");
            RuleFor(x => x.Start).LessThan(x => x.End).WithMessage("Start must be before End.");
            RuleFor(x => x.VenueId).GreaterThan(0).WithMessage("VenueId must be provided and greater than 0.");
        }
    }
}
