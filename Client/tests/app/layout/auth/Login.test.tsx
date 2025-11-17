import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";

// Mock CSS imports
vi.mock("../../../../src/app/layout/auth/style/login.css", () => ({}));

// Create mock functions that will be used across tests
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

// Mock Redux hooks
vi.mock("../../../../src/lib/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(),
}));

// Mock react-router
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../../src/lib/api", () => ({
  UserApi: {
    login: vi.fn(),
  },
}));

vi.mock("../../../../src/lib/utils", () => ({
  InputSanitizer: {
    sanitizeText: vi.fn((text) => text),
  },
  Logger: {
    error: vi.fn(),
  },
}));

// Mock the auth slice actions
vi.mock("../../../../src/app/layout/auth/authSlice", () => ({
  clearUser: vi.fn(),
  setUser: vi.fn(() => ({ type: "auth/setUser" })),
}));

// Import AFTER mocks are set up
import Login from "../../../../src/app/layout/auth/Login";
import { UserApi } from "../../../../src/lib/api";

const mockStore = configureStore([]);

describe("Login Component", () => {
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = vi.fn();

    vi.clearAllMocks();
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>,
    );
  };

  it("should render the login form correctly", () => {
    renderComponent();
    expect(screen.getByLabelText(/Username/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole("button", { name: /Login/i })).toBeDefined();
  });

  it("should update username state on input change", () => {
    renderComponent();
    const usernameInput = screen.getByLabelText(
      /Username/i,
    ) as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "testuser" } });

    expect(usernameInput.value).toBe("testuser");
  });

  it("should update password state on input change", () => {
    renderComponent();
    const passwordInput = screen.getByLabelText(
      /Password/i,
    ) as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(passwordInput.value).toBe("password123");
  });

  it("should call UserApi.login with correct credentials", async () => {
    const mockLogin = vi.mocked(UserApi.login);
    mockLogin.mockResolvedValue({
      data: { username: "testuser", token: "fake-token" },
    } as any);

    renderComponent();
    const usernameInput = screen.getByLabelText(
      /Username/i,
    ) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(
      /Password/i,
    ) as HTMLInputElement;
    const loginButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: "testuser",
          password: "password123",
        });
      },
      { timeout: 5000 },
    );
  });
});
