"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Eye,
  User,
  Globe,
  Code,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuditLogs } from "@/hooks/queries/use-audit-logs";
import type { AuditLog, AuditAction } from "@/resources/interfaces";
import { formatDate } from "@/lib/utils";

const COMMON_ACTIONS: AuditAction[] = [
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGED",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "USER_ROLE_ASSIGNED",
  "USER_ROLE_REMOVED",
  "ROLE_CREATED",
  "ROLE_UPDATED",
  "ROLE_DELETED",
  "ROLE_PERMISSION_ASSIGNED",
  "ROLE_PERMISSION_REMOVED",
  "PERMISSION_CREATED",
  "PERMISSION_DELETED",
];

export function AuditLogsView() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isPlaceholderData } = useAuditLogs({
    page,
    limit,
    action: selectedAction !== "all" ? (selectedAction as AuditAction) : undefined,
    resource: resourceFilter || undefined,
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const logs = data?.data ?? [];

  const handleClearFilters = () => {
    setSelectedAction("all");
    setResourceFilter("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-[#7D7E8B]">
          Cryptographically audited event log tracking all platform operations and security state changes.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1E1E26] bg-[#121217] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Select value={selectedAction} onValueChange={(val) => { setSelectedAction(val); setPage(1); }}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-[#E0E0E6]">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent className="bg-[#14141A] border-[#22222C] text-xs text-[#E0E0E6]">
              <SelectItem value="all">All Actions</SelectItem>
              {COMMON_ACTIONS.map((act) => (
                <SelectItem key={act} value={act} className="font-mono text-xs">
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Filter by resource (e.g. users)..."
            className="w-48 h-9 text-xs rounded-xl bg-[#16161D] border-[#22222C] text-white placeholder:text-[#6F707E]"
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value.trim());
              setPage(1);
            }}
          />

          {(selectedAction !== "all" || resourceFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-9 px-2 text-[#7D7E8B] hover:text-white"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        <span className="text-xs text-[#7D7E8B]">
          {total} total event{total === 1 ? "" : "s"} logged
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#1E1E26] bg-[#121217] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-[#181820]" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center p-8 text-center">
            <FileText className="h-10 w-10 text-[#454652] mb-3" />
            <h3 className="text-base font-semibold text-white">No audit records found</h3>
            <p className="text-xs text-[#7D7E8B] mt-1">
              {selectedAction !== "all" || resourceFilter
                ? "No logs match the selected filter criteria."
                : "No platform audit logs recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full min-w-[750px]">

              <TableHeader>
                <TableRow className="border-b border-[#1E1E26] hover:bg-transparent">
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Timestamp</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Actor</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Resource</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Resource ID</TableHead>
                  <TableHead className="text-[#6F707E] text-xs font-semibold uppercase tracking-wider">IP Address</TableHead>
                  <TableHead className="text-right text-[#6F707E] text-xs font-semibold uppercase tracking-wider">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="border-b border-[#1A1A22] hover:bg-[#16161D]/60 transition-colors cursor-pointer"
                  >
                    <TableCell className="text-xs text-[#7D7E8B] whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-white">
                          {log.actor?.name || "System"}
                        </span>
                        <span className="text-[11px] text-[#6F707E] truncate max-w-[140px]">
                          {log.actor?.email || "Automated"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {log.action}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs capitalize text-white">
                      {log.resource}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-[#7D7E8B]">
                      {log.resourceId ? `${log.resourceId.slice(0, 8)}...` : "—"}
                    </TableCell>

                    <TableCell className="font-mono text-xs text-[#7D7E8B]">
                      {log.ipAddress || "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="h-8 px-2 text-xs text-[#7D7E8B] hover:text-white"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E1E26] px-5 py-3.5 text-xs text-[#7D7E8B]">
            <div>
              Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(page * limit, total)}</span> of{" "}
              <span className="font-semibold text-white">{total}</span> events
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="h-8 px-2.5 text-xs rounded-lg bg-[#16161D] border-[#22222C] text-[#E0E0E6]"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="px-2 font-medium text-white">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isPlaceholderData}
                className="h-8 px-2.5 text-xs rounded-lg bg-[#16161D] border-[#22222C] text-[#E0E0E6]"
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Details Sheet */}
      <Sheet open={Boolean(selectedLog)} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg bg-[#0E0E12] border-l border-[#1D1D24] text-white overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-[#1E1E26]">
            <SheetTitle className="text-lg font-bold flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-rose-400" />
              Audit Event Details
            </SheetTitle>
            <SheetDescription className="font-mono text-xs text-[#6F707E]">
              ID: {selectedLog?.id}
            </SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="space-y-6 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#14141A] p-4 border border-[#20202A]">
                <div className="space-y-1">
                  <span className="text-[#6F707E] font-medium">Action</span>
                  <p className="font-mono font-bold text-sm text-white">{selectedLog.action}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#6F707E] font-medium">Resource</span>
                  <p className="font-mono text-sm capitalize font-semibold text-white">{selectedLog.resource}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#6F707E] font-medium">Timestamp</span>
                  <p className="text-[#A2A3B0]">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[#6F707E] font-medium">Resource ID</span>
                  <p className="font-mono text-[#A2A3B0] truncate">{selectedLog.resourceId || "None"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <User className="h-4 w-4 text-rose-400" />
                  Actor Information
                </h4>
                <div className="rounded-xl border border-[#20202A] bg-[#14141A] p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6F707E]">Name:</span>
                    <span className="font-medium text-white">{selectedLog.actor?.name || "System"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6F707E]">Email:</span>
                    <span className="font-mono text-[#A2A3B0]">{selectedLog.actor?.email || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-rose-400" />
                  Network &amp; Device
                </h4>
                <div className="rounded-xl border border-[#20202A] bg-[#14141A] p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6F707E]">IP Address:</span>
                    <span className="font-mono text-white">{selectedLog.ipAddress || "—"}</span>
                  </div>
                  {selectedLog.userAgent && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[#6F707E]">User Agent:</span>
                      <p className="font-mono text-[11px] text-[#A2A3B0] break-all bg-[#181822] p-2 rounded-lg">
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-rose-400" />
                  Event Metadata Payload
                </h4>
                <div className="rounded-xl border border-[#20202A] bg-[#14141A] p-3 overflow-x-auto">
                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 ? (
                    <pre className="font-mono text-[11px] text-[#A2A3B0] whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-[#525360] italic">No metadata payload.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
