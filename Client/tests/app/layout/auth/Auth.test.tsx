import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";
import {
  RequireAuth,
  RequireNoAuth,
  RequireAdmin,
} from "../../../../src/app/layout/auth/Auth";
import { UserRoles } from "../../../../src/lib/enums";

const mockNavigate = vi.fn();
const mockHasUserSession = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Navigate: (props) => {
      mockNavigate(props.to);
      return <div data-testid="navigate" />;
    },
  };
});

vi.mock("../../../../src/lib/utils", () => ({
  hasUserSession: () => mockHasUserSession()
}));

const mockStore = configureStore([]);
const TestComponent = () => <div>Protected Content</div>;

describe("Auth Components", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("RequireAuth", () => {
    it("should render children if user has a session", () => {
      mockHasUserSession.mockReturnValue(true);
      const { getByText } = render(
        <MemoryRouter>
          <RequireAuth>
            <TestComponent />
          </RequireAuth>
        </MemoryRouter>
      );
      expect(getByText("Protected Content")).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should redirect to /login if user has no session", () => {
      mockHasUserSession.mockReturnValue(false);
      render(
        <MemoryRouter>
          <RequireAuth>
            <TestComponent />
          </RequireAuth>
        </MemoryRouter>
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  describe("RequireNoAuth", () => {
    it("should render children if user has no session", () => {
      mockHasUserSession.mockReturnValue(false);
      const { getByText } = render(
        <MemoryRouter>
          <RequireNoAuth>
            <TestComponent />
          </RequireNoAuth>
        </MemoryRouter>
      );
      expect(getByText("Protected Content")).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should redirect to / if user has a session", () => {
      mockHasUserSession.mockReturnValue(true);
      render(
        <MemoryRouter>
          <RequireNoAuth>
            <TestComponent />
          </RequireNoAuth>
        </MemoryRouter>
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("RequireAdmin", () => {
    it("should redirect to /login if user has no session", () => {
      mockHasUserSession.mockReturnValue(false);
      const store = mockStore({
        auth: { user: null }
      });
      render(
        <Provider store={store}>
          <MemoryRouter>
            <RequireAdmin>
              <TestComponent />
            </RequireAdmin>
          </MemoryRouter>
        </Provider>
      );
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("should redirect to / if user is not an admin", () => {
      mockHasUserSession.mockReturnValue(true);
      const store = mockStore({
        auth: { user: { userRole: UserRoles.USER } },
      });
      render(
        <Provider store={store}>
          <MemoryRouter>
            <RequireAdmin>
              <TestComponent />
            </RequireAdmin>
          </MemoryRouter>
        </Provider>
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should render children if user is an admin", () => {
      mockHasUserSession.mockReturnValue(true);
      const store = mockStore({
        auth: { user: { userRole: UserRoles.ADMIN } },
      });
      const { getByText } = render(
        <Provider store={store}>
          <MemoryRouter>
            <RequireAdmin>
              <TestComponent />
            </RequireAdmin>
          </MemoryRouter>
        </Provider>
      );
      expect(getByText("Protected Content")).toBeDefined();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
