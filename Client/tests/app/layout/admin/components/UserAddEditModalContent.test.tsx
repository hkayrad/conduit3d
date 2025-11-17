import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import UserActionModalContent from "../../../../../src/app/layout/admin/components/UserAddEditModalContent";

describe("UserActionModalContent Component", () => {
  afterEach(() => {
    cleanup();
  });

  const mockSetUser = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockHandleCloseModal = vi.fn();

  const defaultUser = {
    id: 1,
    createdAt: new Date(Date.now()),
    username: "testuser",
    password: "password123",
    name: "Test User",
    email: "test@example.com",
    userRole: "user",
    isActive: true,
  };

  it("renders all input fields with correct values", () => {
    render(
      <UserActionModalContent
        title="Add User"
        user={defaultUser}
        setUser={mockSetUser}
        handleSubmit={mockHandleSubmit}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    expect(screen.getByLabelText("Username:")).toHaveValue("testuser");
    expect(screen.getByLabelText("Password:")).toHaveValue("password123");
    expect(screen.getByLabelText("Name:")).toHaveValue("Test User");
    expect(screen.getByLabelText("Email:")).toHaveValue("test@example.com");
    expect(screen.getByLabelText("Role:")).toHaveValue("user");
    expect(screen.getByLabelText("Status:")).toHaveValue("true");
  });

  it("calls setUser on input change", () => {
    render(
      <UserActionModalContent
        title="Edit User"
        user={defaultUser}
        setUser={mockSetUser}
        handleSubmit={mockHandleSubmit}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    fireEvent.change(screen.getByLabelText("Username:"), {
      target: { value: "newuser" },
    });
    expect(mockSetUser).toHaveBeenCalledWith({
      ...defaultUser,
      username: "newuser",
    });
  });

  it("toggles password visibility", () => {
    render(
      <UserActionModalContent
        title="Edit User"
        user={defaultUser}
        setUser={mockSetUser}
        handleSubmit={mockHandleSubmit}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    const passwordInput = screen.getByLabelText("Password:");
    const toggleButton = screen.getByRole("button", { name: "" }); // Icon button has no accessible name
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("calls handleCloseModal on cancel button click", () => {
    render(
      <UserActionModalContent
        title="Edit User"
        user={defaultUser}
        setUser={mockSetUser}
        handleSubmit={mockHandleSubmit}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockHandleCloseModal).toHaveBeenCalled();
  });
});
