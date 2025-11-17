import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import UserDeleteModalContent from "../../../../../src/app/layout/admin/components/UserDeleteModalContent";

describe("UserDeleteModalContent Component", () => {
  afterEach(() => {
    cleanup();
  });

  const mockHandleDelete = vi.fn();
  const mockHandleCloseModal = vi.fn();

  const user = {
    id: 42,
    createdAt: new Date(Date.now()),
    username: "deleteuser",
    password: "",
    name: "Delete User",
    email: "delete@example.com",
    userRole: "user",
    isActive: true,
  };

  it("renders the delete confirmation message with username", () => {
    render(
      <UserDeleteModalContent
        user={user}
        handleDelete={mockHandleDelete}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    expect(screen.getByText("Delete User")).toBeInTheDocument();
    expect(
      screen.getByText(
        `Are you sure you want to delete user ${user.username}?`,
      ),
    ).toBeInTheDocument();
  });

  it("calls handleCloseModal when Cancel button is clicked", () => {
    render(
      <UserDeleteModalContent
        user={user}
        handleDelete={mockHandleDelete}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockHandleCloseModal).toHaveBeenCalled();
  });

  it("calls handleDelete with user id when Delete button is clicked", () => {
    render(
      <UserDeleteModalContent
        user={user}
        handleDelete={mockHandleDelete}
        handleCloseModal={mockHandleCloseModal}
      />,
    );
    fireEvent.click(screen.getByText("Delete"));
    expect(mockHandleDelete).toHaveBeenCalledWith(user.id);
  });
});
