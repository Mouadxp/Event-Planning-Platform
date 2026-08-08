using FluentValidation;
using Event_Planning_Platform.Models.Dtos;

namespace Event_Planning_Platform.Validators
{
    public class VenueDtoValidator : AbstractValidator<VenueDto>
    {
        public VenueDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required.");
            RuleFor(x => x.Capacity).GreaterThan(0).WithMessage("Capacity must be greater than 0.");
        }
    }
}
