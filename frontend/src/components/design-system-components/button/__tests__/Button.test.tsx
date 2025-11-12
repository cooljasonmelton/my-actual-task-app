import { fireEvent, render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders children with default classes", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn", "btn--primary", "btn--medium");
    expect(button).not.toHaveClass("btn--disabled", "btn--loading");
  });

  it("applies variant, size, and custom class names", () => {
    render(
      <Button variant="secondary" size="large" className="extra-class">
        Action
      </Button>
    );

    const button = screen.getByRole("button", { name: "Action" });
    expect(button).toHaveClass("btn--secondary", "btn--large", "extra-class");
  });

  it("calls onClick when enabled", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables the button and prevents clicks when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("btn--disabled");

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("adds loading styles without forcing disabled state", () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole("button", { name: "Loading" });
    expect(button).toHaveClass("btn--loading");
    expect(button).not.toBeDisabled();
  });

  it("respects explicit type and form props", () => {
    render(
      <Button type="submit" form="test-form">
        Save
      </Button>
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("form", "test-form");
  });
});
