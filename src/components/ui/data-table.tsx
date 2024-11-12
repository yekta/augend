import {
  Column,
  flexRender,
  Table as TanstackTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { CSSProperties, Dispatch, SetStateAction } from "react";
import Indicator from "@/components/cards/indicator";

type TPage = {
  min: number;
  max: number;
  current: number;
};

export default function DataTable<T, Z>({
  data,
  table,
  isPending,
  isRefetching,
  isError,
  isLoadingError,
  page,
  setPage,
  className,
}: {
  data: Z;
  table: TanstackTable<T>;
  isPending: boolean;
  isRefetching: boolean;
  isError: boolean;
  isLoadingError: boolean;
  page: TPage;
  setPage: Dispatch<SetStateAction<TPage>>;
  className?: string;
}) {
  return (
    <div
      data-is-loading-error={(isLoadingError && true) || undefined}
      data-is-pending={(isPending && true) || undefined}
      data-has-data={(!isPending && data !== undefined) || undefined}
      className={cn(
        "w-full h-128 flex flex-1 text-sm flex-col justify-center items-center border rounded-xl gap-3 group/table relative overflow-hidden",
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
                        "cursor-pointer not-touch:hover:bg-background-secondary",
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
                className="group/row not-touch:group-data-[has-data]/table:hover:bg-background-secondary"
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
                        "bg-background not-touch:group-data-[has-data]/table:group-hover/row:bg-background-secondary"
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
            <PaginationContent className="overflow-x-auto relative">
              <div className="flex items-center justify-center relative">
                {Array.from({ length: page.max - page.min + 1 }, (_, i) => {
                  const adjustedPage = i + page.min;
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        data-active={page.current === adjustedPage}
                        className="p-1 flex w-14 h-10.5 md:h-11 items-center justify-center font-medium group/link transition-none rounded-none border-none text-xs md:text-sm 
                        text-foreground/50 data-[active=true]:text-foreground not-touch:hover:bg-transparent hover:text-foreground"
                        isActive={page.current === adjustedPage}
                        isButton={true}
                        onClick={() =>
                          setPage((p) => ({
                            ...p,
                            current: adjustedPage,
                          }))
                        }
                      >
                        <p className="min-w-0 w-full overflow-hidden overflow-ellipsis rounded-md p-2 items-center justify-center not-touch:group-hover/link:bg-background-secondary">
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
                  className="h-full absolute p-1 left-0 top-0 transition flex items-center justify-center pointer-events-none"
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
        hasData={data !== undefined}
      />
    </div>
  );
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
