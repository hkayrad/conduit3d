import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";
import List from "../../../../src/app/layout/list/List";
import { ListDataType } from "../../../../src/lib/enums";

// Add this after your imports
declare global {
  interface Window {
    __tableSetQuery?: (query: string) => void;
  }
}

// Mock hooks and modules
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockFlyTo = vi.fn();
const mockHandleRefreshData = vi.fn();
const mockHandleSetQuery = vi.fn();

vi.mock("../../../../src/lib/hooks", async () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(),
  useList: vi.fn(),
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ flyTo: mockFlyTo }),
  };
});

vi.mock("../../../../src/lib/utils/geometry/wkbToGeometry", () => ({
  wkbToGeometry: () => ({ type: "Point", coordinates: [0, 0] }),
}));

// Improved Table mock: expose setQuery to window for test access
vi.mock("../../../../src/app/shared/table/Table", () => ({
  __esModule: true,
  default: (props: any) => {
    // Attach setQuery to window for test access
    window.__tableSetQuery = props.setQuery;
    return (
      <div data-testid="table">
        {props.data.rows.map((row: any, rowIndex: any) => (
          <div key={rowIndex} role="row">
            {row.map((cell: any, cellIndex: any) => (
              <div key={cellIndex} role="cell">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const mockStore = configureStore([]);

const TestWrapper = ({ store, children }: { store: any; children: any }) => (
  <Provider store={store}>
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Outlet context={{ flyTo: mockFlyTo }} />}>
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  </Provider>
);

describe("List Component", () => {
  let store: any;
  let useAppSelector;
  let useList;

  beforeEach(async () => {
    vi.resetModules(); // Ensure mocks are fresh for each test

    // Dynamically import to re-evaluate mocks for each test
    const hooks = await import("../../../../src/lib/hooks");
    useAppSelector = hooks.useAppSelector;
    useList = hooks.useList;

    const listState = {
      itemsPerPage: 10,
      pageNumber: 1,
      sortBy: "id",
      ascending: true,
      featureType: ListDataType.AdrBina,
      query: "",
    };

    (useAppSelector as any).mockReturnValue(listState);

    (useList as any).mockReturnValue({
      features: [
        {
          id: 1,
          name: "Building A",
          wkb: "0x0101000000000000000000F03F000000000000F03F",
        },
        {
          id: 2,
          name: "Building B",
          wkb: "0x0101000000000000000000F03F000000000000F03F",
        },
      ],
      featureCount: 2,
      tableData: { headers: [], rows: [] },
      setTableData: vi.fn(),
      handleChangeItemsPerPage: vi.fn(),
      handleSetPageNumber: vi.fn(),
      handleSetSortBy: vi.fn(),
      handleSetAscending: vi.fn(),
      handleSetQuery: mockHandleSetQuery,
      handleRefreshData: mockHandleRefreshData,
    });

    store = mockStore({
      list: listState,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render the component with initial state", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper store={store}>
        <List />
      </TestWrapper>,
    );

    expect(getByText("Feature Type")).toBeDefined();
    expect(getByText("Binalar")).toBeDefined();
    expect(getByTestId("table")).toBeDefined();
  });

  it("should dispatch setFeatureType when a feature type button is clicked", () => {
    const { getByText } = render(
      <TestWrapper store={store}>
        <List />
      </TestWrapper>,
    );

    // If you add data-testid to the button in List, use getByTestId here.
    // Otherwise, this is still fragile, but left as-is for now.
    const adrYolButton = getByText("AdrYol");
    fireEvent.click(adrYolButton);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "list/setFeatureType",
      payload: ListDataType.AdrYol,
    });
  });

  it("should call handleRefreshData on initial render due to useEffect", () => {
    render(
      <TestWrapper store={store}>
        <List />
      </TestWrapper>,
    );
    expect(mockHandleRefreshData).toHaveBeenCalled();
  });
});
