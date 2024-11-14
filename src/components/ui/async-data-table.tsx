import Indicator from "@/components/cards/indicator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumberTBMK } from "@/lib/number-formatters";
import { cn } from "@/lib/utils";
import {
  CellContext,
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  HeaderContext,
  SortDirection,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { CSSProperties, Dispatch, SetStateAction, useMemo } from "react";

export type TAsyncDataTablePage = {
  min: number;
  max: number;
  current: number;
};

export type TAsyncDataTableColumnDef<T> = ColumnDef<T> & {
  isPinnedLeft?: boolean;
  accessorKey: string;
  headerType?: "regular" | "custom";
  headerAlignment?: "start" | "end";
  cellType?: "regular" | "change" | "custom";
  cellClassName?: string;
  headerClassName?: string;
};

export default function AsyncDataTable<T>({
  columnDefs,
  data,
  isPending,
  isRefetching,
  isError,
  isLoadingError,
  page,
  setPage,
  className,
  sorting,
  setSorting,
}: {
  columnDefs: TAsyncDataTableColumnDef<T>[];
  data: T[];
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  isLoadingError: boolean;
  page: TAsyncDataTablePage;
  setPage: Dispatch<SetStateAction<TAsyncDataTablePage>>;
  className?: string;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
}) {
  const columnDefsFinal = useMemo(() => {
    return columnDefs.map((columnDef, index) => {
      const firstColumnClasses = index === 0 ? "pl-4 md:pl-5" : "";
      const lastColumnClasses =
        index === columnDefs.length - 1 ? "pr-4 md:pr-5" : "";

      const headerFinal = getHeader({
        columnDef,
        firstColumnClasses,
        lastColumnClasses,
      });
      const cellFinal = getCell({
        columnDef,
        firstColumnClasses,
        lastColumnClasses,
        isPending,
        isLoadingError,
      });

      return {
        meta: {
          width: `${100 / columnDefs.length}%`,
        },
        ...columnDef,
        header: headerFinal,
        cell: cellFinal,
      };
    });
  }, [columnDefs, data, isPending, isLoadingError]);

  const table = useReactTable({
    data,
    columns: columnDefsFinal,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      columnPinning: {
        left: columnDefs
          .filter((c) => c.isPinnedLeft)
          .map((c) => c.accessorKey),
      },
    },
    enableColumnPinning: true,
  });

  return (
    <div
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={
        (!isPending && !isLoadingError && data !== undefined) || undefined
      }
      className={cn(
        "w-full h-128 flex flex-col text-sm justify-center items-center border rounded-xl gap-3 group/table relative overflow-hidden",
        className
      )}
    >
      <div className="w-full h-full flex flex-col">
        <Table>
          <TableHeader className="bg-background sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow borderless key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      ...getCommonPinningStyles(header.column),
                      width: header.column.columnDef.meta?.width,
                    }}
                    className={cn(
                      "overflow-hidden",
                      header.column.getCanSort() &&
                        "cursor-pointer not-touch:hover:bg-background-secondary active:bg-background-secondary",
                      header.column.getIsPinned() && "bg-background"
                    )}
                  >
                    <div className="border-b overflow-hidden max-w-full">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, i) => (
              <TableRow
                borderless
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="group/row not-touch:group-data-[has-data]/table:hover:bg-background-secondary group-data-[has-data]/table:active:bg-background-secondary"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={{
                      ...getCommonPinningStyles(cell.column),
                      width: cell.column.columnDef.meta?.width,
                    }}
                    className={cn(
                      "p-0 overflow-hidden",
                      cell.column.getIsPinned() &&
                        "bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-secondary group-data-[has-data]/table:group-active/row:bg-background-secondary"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full border-t">
          <Pagination>
            <PaginationContent className="overflow-x-auto px-0.75 relative">
              <div className="flex items-center justify-center relative">
                {Array.from({ length: page.max - page.min + 1 }, (_, i) => {
                  const adjustedPage = i + page.min;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        data-active={page.current === adjustedPage}
                        className="px-0.75 py-1.5 flex w-14 h-10.5 md:h-11 items-center justify-center font-medium group/link transition-none rounded-none border-none text-xs md:text-sm 
                        text-foreground/50 data-[active=true]:text-foreground not-touch:hover:bg-transparent active:bg-transparent not-touch:hover:text-foreground active:text-foreground"
                        isActive={page.current === adjustedPage}
                        isButton={true}
                        onClick={() =>
                          setPage((p) => ({
                            ...p,
                            current: adjustedPage,
                          }))
                        }
                      >
                        <p className="min-w-0 w-full h-full overflow-hidden overflow-ellipsis rounded-md p-0.5 flex items-center justify-center not-touch:group-hover/link:bg-background-secondary group-active/link:bg-background-secondary">
                          {adjustedPage}
                        </p>
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <div
                  style={{
                    transform: `translateX(${
                      100 * (page.current - page.min)
                    }%)`,
                    width: `${100 / (page.max - page.min + 1)}%`,
                  }}
                  className="h-full absolute px-0.75 py-1.5 left-0 top-0 transition flex items-center justify-center pointer-events-none"
                >
                  <div className="w-full border h-full rounded-md" />
                </div>
              </div>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
      <Indicator
        isError={isError}
        isPending={isPending}
        isRefetching={isRefetching}
        hasData={!isLoadingError && data !== undefined}
      />
    </div>
  );
}

function getHeader<T>({
  columnDef,
  firstColumnClasses,
  lastColumnClasses,
}: {
  columnDef: TAsyncDataTableColumnDef<T>;
  firstColumnClasses: string;
  lastColumnClasses: string;
}) {
  const header = columnDef.header;
  const headerType = columnDef.headerType || "regular";
  const headerAlignment = columnDef.headerAlignment || "end";

  if (headerType === "custom" || header === undefined) {
    return header;
  }

  return (props: HeaderContext<T, unknown>) => (
    <HeaderColumn
      className={cn(
        `${
          headerAlignment === "start" ? "justify-start mr-auto ml-0" : ""
        } ${firstColumnClasses} ${lastColumnClasses}`,
        columnDef.headerClassName
      )}
      innerClassName={
        headerAlignment === "start" ? "justify-start text-left" : undefined
      }
      isSorted={props.header.column.getIsSorted()}
      indicatorPosition={headerAlignment === "start" ? "end" : "start"}
      sortDescFirst={columnDef.sortDescFirst}
    >
      {typeof header === "string" ? header : header(props)}
    </HeaderColumn>
  );
}

function getCell<T>({
  columnDef,
  firstColumnClasses,
  lastColumnClasses,
  isPending,
  isLoadingError,
}: {
  columnDef: TAsyncDataTableColumnDef<T>;
  firstColumnClasses: string;
  lastColumnClasses: string;
  isPending: boolean;
  isLoadingError: boolean;
}) {
  const cell = columnDef.cell;
  const cellType = columnDef.cellType || "regular";
  const alignment = columnDef.headerAlignment || "end";

  if (cellType === "custom" || cell === undefined || typeof cell === "string") {
    return cell;
  }

  if (cellType === "change") {
    return (props: CellContext<T, unknown>) => {
      return (
        <ChangeColumn
          change={cell(props)}
          isPending={isPending}
          isLoadingError={isLoadingError}
          className={cn(
            `${firstColumnClasses} ${lastColumnClasses} ${
              alignment === "start" ? "justify-start mr-auto ml-0" : ""
            }`,
            columnDef.cellClassName
          )}
        />
      );
    };
  }

  return (props: CellContext<T, unknown>) => {
    return (
      <RegularColumn
        isPending={isPending}
        isLoadingError={isLoadingError}
        className={cn(
          `${firstColumnClasses} ${lastColumnClasses} ${
            alignment === "start" ? "justify-start mr-auto ml-0 text-left" : ""
          }`,
          columnDef.cellClassName
        )}
        classNameParagraph={alignment === "start" ? "text-left" : undefined}
      >
        {cell(props)}
      </RegularColumn>
    );
  };
}

const pendingClasses =
  "group-data-[is-pending]/table:text-transparent group-data-[is-pending]/table:bg-foreground group-data-[is-pending]/table:rounded-sm group-data-[is-pending]/table:animate-skeleton";
const paddingLeft = "pl-2 md:pl-4";
const paddingRight = "pr-2 md:pr-4";
const paddingY = "py-3.5";
const defaultColumnClasses = "w-22 md:w-32 ml-auto";

function HeaderColumn({
  className,
  innerClassName,
  children,
  isSorted,
  indicatorPosition = "start",
  sortDescFirst = true,
}: {
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
  isSorted?: false | SortDirection;
  indicatorPosition?: "start" | "end";
  sortDescFirst?: boolean;
}) {
  return (
    <div
      className={cn(
        `${paddingLeft} ${paddingRight} ${defaultColumnClasses} ${paddingY} flex items-center justify-end select-none gap-1`,
        className
      )}
    >
      <ArrowDownIcon
        data-sort={
          isSorted === "asc" ? "asc" : isSorted === "desc" ? "desc" : false
        }
        data-indicator-position={indicatorPosition}
        className={cn(
          "size-3.5 -my-1 shrink-0 data-[indicator-position=end]:order-last data-[sort=false]:opacity-0 data-[sort=asc]:rotate-180 data-[sort=desc]:rotate-0 transition",
          sortDescFirst === false ? "rotate-180" : undefined
        )}
      />
      <p
        className={cn(
          `overflow-hidden overflow-ellipsis text-right text-xs md:text-sm leading-none md:leading-none`,
          innerClassName,
          "overflow-ellipsis"
        )}
      >
        {children}
      </p>
    </div>
  );
}

function ChangeColumn({
  change,
  isPending,
  isLoadingError,
  className,
}: {
  change: number;
  isPending: boolean;
  isLoadingError: boolean;
  className?: string;
}) {
  const { isPositive, isNegative, Icon } = getChangeInfo(change);

  return (
    <div
      data-is-negative={isNegative ? true : undefined}
      data-is-positive={isPositive ? true : undefined}
      className={cn(
        `${paddingLeft} ${paddingRight} ${paddingY} ${defaultColumnClasses} text-xs md:text-sm md:leading-none break-words leading-none font-medium flex text-right overflow-hidden overflow-ellipsis items-center justify-end text-muted-foreground data-[is-loading-error]:text-destructive data-[is-negative]:text-destructive data-[is-positive]:text-success`,
        className
      )}
    >
      {!isPending && !isLoadingError && (
        <Icon className="size-3.5 md:size-4 shrink-0 -my-0.5" />
      )}
      <p
        className={`${pendingClasses} shrink min-w-0 overflow-hidden overflow-ellipsis group-data-[is-loading-error]/table:text-destructive`}
      >
        {isPending
          ? "Loading"
          : !isLoadingError
            ? formatNumberTBMK(change, 3, false, true)
            : "Error"}
      </p>
    </div>
  );
}

function RegularColumn({
  children,
  className,
  classNameParagraph,
  isPending,
  isLoadingError,
}: {
  children: string;
  className?: string;
  classNameParagraph?: string;
  isPending: boolean;
  isLoadingError: boolean;
}) {
  return (
    <div
      className={cn(
        `${paddingLeft} ${paddingRight} ${paddingY} ${defaultColumnClasses} text-xs md:text-sm md:leading-none font-medium flex items-center justify-end overflow-hidden`,
        className
      )}
    >
      <p
        className={cn(
          `${pendingClasses} max-w-full break-words leading-none text-right overflow-hidden overflow-ellipsis group-data-[is-loading-error]/table:text-destructive`,
          classNameParagraph
        )}
      >
        {isPending ? "Loading" : !isLoadingError ? children : "Error"}
      </p>
    </div>
  );
}

function getChangeInfo(change: number | undefined) {
  const isPositive = change ? change > 0 : undefined;
  const isNegative = change ? change < 0 : undefined;

  const Icon =
    isNegative === true
      ? ArrowDownIcon
      : isPositive === true
        ? ArrowUpIcon
        : ArrowRightIcon;
  return {
    isPositive,
    isNegative,
    Icon,
  };
}

function getCommonPinningStyles<T>(column: Column<T>): CSSProperties {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 1 : 0,
  };
}
