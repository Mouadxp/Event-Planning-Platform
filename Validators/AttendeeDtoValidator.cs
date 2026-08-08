using FluentValidation;
using Event_Planning_Platform.Models.Dtos;

namespace Event_Planning_Platform.Validators
{
    public class AttendeeDtoValidator : AbstractValidator<AttendeeDto>
    {
        public AttendeeDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
            RuleFor(x => x.EventId).GreaterThan(0).WithMessage("EventId must be provided and greater than 0.");
            RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.Email)).WithMessage("Email must be valid.");
        }
    }
}
