import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock child components
vi.mock("../../../../src/app/layout/admin/components/Stats", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="stats">{JSON.stringify(props)}</div>
  ),
}));
vi.mock("../../../../src/app/shared/table/Table", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="table">{JSON.stringify(props)}</div>
  ),
}));
vi.mock("../../../../src/app/shared/badge/Badge", () => ({
  __esModule: true,
  default: (props: any) => (
    <span data-testid={`badge-${props.label}`}>{props.label}</span>
  ),
}));
vi.mock("../../../../src/app/shared/actionButton/ActionButton", () => ({
  __esModule: true,
  default: (props: any) => (
    <button
      data-testid={`action-${props.style}-${props.content?.type?.name || ""}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.content}
    </button>
  ),
}));
vi.mock("../../../../src/app/shared/modal/Modal", () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="modal">{props.children}</div>,
}));
vi.mock(
  "../../../../src/app/layout/admin/components/UserAddEditModalContent",
  () => ({
    __esModule: true,
    default: (props: any) => (
      <div data-testid="user-action-modal">{props.title}</div>
    ),
  }),
);
vi.mock(
  "../../../../src/app/layout/admin/components/UserDeleteModalContent",
  () => ({
    __esModule: true,
    default: (props: any) => (
      <div data-testid="user-delete-modal">{props.user.username}</div>
    ),
  }),
);

// Prepare hook mocks
const mockUseAdmin = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock("../../../../src/lib/hooks", () => ({
  useAdmin: () => mockUseAdmin(),
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

import Admin from "../../../../src/app/layout/admin/Admin";

describe("Admin Component", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const baseAdminState = {
    itemsPerPage: 10,
    pageNumber: 1,
    sortBy: "username",
    ascending: true,
    query: "",
  };
  const baseUserState = { id: 1, username: "admin" };

  const baseAdminHook = {
    users: [
      {
        id: 1,
        username: "admin",
        name: "Admin",
        email: "admin@example.com",
        userRole: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        username: "user",
        name: "User",
        email: "user@example.com",
        userRole: "user",
        isActive: false,
        createdAt: new Date().toISOString(),
      },
    ],
    tableData: { headers: [], rows: [] },
    setTableData: vi.fn(),
    userCounts: { totalUsers: 2, activeUsers: 1, inactiveUsers: 1 },
    errorText: "",
    userToAddModify: { id: 2, username: "user" },
    setUserToAddModify: vi.fn(),
    modalStatus: {
      isEditModalOpen: false,
      isAddModalOpen: false,
      isDeleteModalOpen: false,
    },
    handleAddUser: vi.fn(),
    handleDeleteUser: vi.fn(),
    handleEditUser: vi.fn(),
    handleCloseModal: vi.fn(),
    handleEditUserButtonClick: vi.fn(),
    handleAddUserButtonClick: vi.fn(),
    handleDeleteUserButtonClick: vi.fn(),
    handleChangeItemsPerPage: vi.fn(),
    handleSetPageNumber: vi.fn(),
    handleSetSortBy: vi.fn(),
    handleSetAscending: vi.fn(),
    handleSetQuery: vi.fn(),
    handleRefreshData: vi.fn(),
  };

  it("renders Stats and Table components", () => {
    mockUseAdmin.mockReturnValue({ ...baseAdminHook });
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === "selectAdminState") return baseAdminState;
      if (selector.name === "selectUserState") return baseUserState;
      return {};
    });
    render(<Admin />);
    expect(screen.getByTestId("stats")).toBeInTheDocument();
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("renders Edit User modal when isEditModalOpen is true", () => {
    mockUseAdmin.mockReturnValue({
      ...baseAdminHook,
      modalStatus: {
        isEditModalOpen: true,
        isAddModalOpen: false,
        isDeleteModalOpen: false,
      },
    });
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === "selectAdminState") return baseAdminState;
      if (selector.name === "selectUserState") return baseUserState;
      return {};
    });
    render(<Admin />);
    expect(screen.getByTestId("user-action-modal")).toHaveTextContent(
      "Edit User",
    );
  });

  it("renders Add User modal when isAddModalOpen is true", () => {
    mockUseAdmin.mockReturnValue({
      ...baseAdminHook,
      modalStatus: {
        isEditModalOpen: false,
        isAddModalOpen: true,
        isDeleteModalOpen: false,
      },
    });
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === "selectAdminState") return baseAdminState;
      if (selector.name === "selectUserState") return baseUserState;
      return {};
    });
    render(<Admin />);
    expect(screen.getByTestId("user-action-modal")).toHaveTextContent(
      "Add User",
    );
  });

  it("renders Delete User modal when isDeleteModalOpen is true", () => {
    mockUseAdmin.mockReturnValue({
      ...baseAdminHook,
      modalStatus: {
        isEditModalOpen: false,
        isAddModalOpen: false,
        isDeleteModalOpen: true,
      },
    });
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.name === "selectAdminState") return baseAdminState;
      if (selector.name === "selectUserState") return baseUserState;
      return {};
    });
    render(<Admin />);
    expect(screen.getByTestId("user-delete-modal")).toHaveTextContent("user");
  });
});
