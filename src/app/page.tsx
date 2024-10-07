"use client"

import { useMemo, useState } from "react"
import { ALL_POOLS_URL } from "@/services/pool"
import _ from "lodash"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import useSWR from "swr/immutable"

import { Pool, PoolSearch } from "@/types/pool"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Header from "@/components/header"

export default function Home() {
  const rawPools = useSWR<PoolSearch[]>("pools", () =>
    fetch(ALL_POOLS_URL)
      .then((res) => res.json())
      .then((data) => data.data)
  )

  const [filter, setFilter] = useState<{
    search: string
    minTVL: number
  }>({
    search: "",
    minTVL: 1000,
  })
  const setFilterDebounced = useMemo(() => _.debounce(setFilter, 500), [])

  const filteredPools = useMemo(
    () =>
      _.chain(rawPools.data || [])
        .filter((pool) => Number(pool.pool_tvl) > filter.minTVL)
        .filter((pool) => {
          if (!filter.search) return true
          return pool.pool_name
            .toLowerCase()
            .includes(filter.search.toLowerCase())
        })
        .value(),
    [rawPools.data, filter]
  )

  const [pagination, setPagination] = useState({
    page: 0,
    size: 15,
  })

  const { paginatedPools, totalPage } = useMemo(
    () => ({
      paginatedPools: _.chain(filteredPools)
        .slice(
          pagination.page * pagination.size,
          (pagination.page + 1) * pagination.size
        )
        .value(),
      totalPage: Math.ceil(filteredPools.length / pagination.size),
    }),
    [filteredPools, pagination]
  )

  return (
    <main className="container flex min-h-screen flex-col gap-4 py-4">
      <Header />
      <div className="flex items-center gap-2">
        <Input placeholder="Search pool, ex: USDC-USDT" />
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {paginatedPools.map((pool) => (
          <div key={pool.pool_address} className="rounded-md border p-2"></div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1" />
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page === 0}
          onClick={() => setPagination((p) => ({ ...p, page: 0 }))}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page === 0}
          onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="mx-2 text-sm">
          Page {pagination.page + 1} of {totalPage}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page === totalPage - 1}
          onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={pagination.page === totalPage - 1}
          onClick={() => setPagination((p) => ({ ...p, page: totalPage - 1 }))}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </main>
  )
}
