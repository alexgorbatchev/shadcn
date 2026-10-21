import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState, type MouseEvent } from "react";
import { Field, FieldLabel } from "../../Field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../Select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../Pagination";

const meta: Meta<typeof Pagination> = {
  title: "@alexgorbatchev/shadcn/components/navigation/Pagination",
  component: Pagination,
  tags: ["autodocs", "test"],
  argTypes: { density: { control: "select", options: ["compact", "comfortable"] } },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return (
      <div>
        <Pagination {...args}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#page-1"
                onClick={(event) => {
                  event.preventDefault();
                  setPage(1);
                }}
              />
            </PaginationItem>
            {[1, 2, 3].map((number) => (
              <PaginationItem key={number}>
                <PaginationLink
                  href={`#page-${number}`}
                  isActive={page === number}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(number);
                  }}
                >
                  {number}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#page-3"
                onClick={(event) => {
                  event.preventDefault();
                  setPage(3);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <output aria-label="Current page">{page}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: "pagination" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "2" }));
    await expect(canvas.getByRole("status", { name: "Current page" })).toHaveTextContent("2");
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(canvas.getByRole("link", { name: "Go to next page" }));
    await expect(canvas.getByRole("status", { name: "Current page" })).toHaveTextContent("3");
    await userEvent.click(canvas.getByRole("link", { name: "Go to previous page" }));
    await expect(canvas.getByRole("status", { name: "Current page" })).toHaveTextContent("1");
  },
};
export const Compact: Story = { ...Default, args: { density: "compact" } };

export const Simple: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`#page-${page}`} isActive={page === 2} onClick={(event) => event.preventDefault()}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getAllByRole("link")).toHaveLength(3);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "1" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("link", { name: "1" })).toHaveFocus();
  },
};
const onPageLink = fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
export const WithRowsPerPage: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="rows-per-page">Rows per page</FieldLabel>
        <Select defaultValue="25">
          <SelectTrigger id="rows-per-page" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#previous" onClick={onPageLink} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#next" onClick={onPageLink} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole("combobox", { name: "Rows per page" });
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole("option", { name: "50" }));
    await waitFor(() => expect(trigger).toHaveTextContent("50"));
    await waitFor(() => expect(body.queryByRole("listbox")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Go to previous page" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onPageLink).toHaveBeenCalledOnce();
    await expect(canvas.getAllByRole("link")).toHaveLength(2);
  },
};
export const RightToLeft: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <div dir="rtl">
        <Story />
        <div dir="ltr">
          <Pagination aria-label="LTR reference">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#previous"
                  aria-label="Previous LTR"
                  onClick={(event) => event.preventDefault()}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#next" aria-label="Next LTR" onClick={(event) => event.preventDefault()} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    ),
  ],
  play: async (context) => {
    const canvas = within(context.canvasElement);
    const previous = canvas.getByRole("link", { name: "Go to previous page" });
    const next = canvas.getByRole("link", { name: "Go to next page" });
    const previousIcon = previous.querySelector("svg") as SVGSVGElement;
    const nextIcon = next.querySelector("svg") as SVGSVGElement;
    const ltrPrevious = canvas.getByRole("link", { name: "Previous LTR" });
    const ltrNext = canvas.getByRole("link", { name: "Next LTR" });
    await expect(previous.getBoundingClientRect().left).toBeGreaterThan(next.getBoundingClientRect().right);
    await expect(previousIcon.getBoundingClientRect().left).toBeGreaterThan(
      within(previous).getByText("Previous").getBoundingClientRect().right,
    );
    await expect(nextIcon.getBoundingClientRect().right).toBeLessThan(
      within(next).getByText("Next").getBoundingClientRect().left,
    );
    await expect(getComputedStyle(previous).paddingInlineStart).toBe(getComputedStyle(ltrPrevious).paddingInlineStart);
    await expect(getComputedStyle(previous).paddingInlineEnd).toBe(getComputedStyle(ltrPrevious).paddingInlineEnd);
    await expect(getComputedStyle(next).paddingInlineStart).toBe(getComputedStyle(ltrNext).paddingInlineStart);
    await expect(getComputedStyle(next).paddingInlineEnd).toBe(getComputedStyle(ltrNext).paddingInlineEnd);
    await expect(previousIcon.getScreenCTM()?.a).toBeLessThan(0);
    await expect(nextIcon.getScreenCTM()?.a).toBeLessThan(0);
    await Default.play?.(context);
  },
};
