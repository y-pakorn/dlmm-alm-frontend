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
import numbro from "numbro"
import useSWR from "swr/immutable"

import { Pool } from "@/types/pool"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import Header from "@/components/header"
import { TokenAvatar } from "@/components/tokenAvatar"

export default function Home() {
  const rawPools = useSWR<Pool[]>("pools", () =>
    fetch(ALL_POOLS_URL)
      .then((res) => res.json())
      .then((data) => data.pairs)
  )

  const [filter, setFilter] = useState<{
    search: string
    minTVL: number
  }>({
    search: "",
    minTVL: 20000,
  })
  const setFilterDebounced = useMemo(() => _.debounce(setFilter, 500), [])

  const filteredPools = useMemo(
    () =>
      _.chain(rawPools.data || [])
        .filter((pool) => Number(pool.liquidity) > filter.minTVL)
        .filter((pool) => {
          if (!filter.search) return true
          return pool.name.toLowerCase().includes(filter.search.toLowerCase())
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
        <div className="w-96 space-y-1">
          <span className="text-sm">
            Minimum TVL: ${numbro(filter.minTVL).format("0,0")}
          </span>
          <Slider
            className="h-10"
            defaultValue={[filter.minTVL]}
            onValueChange={([minTVL]) => {
              setFilterDebounced((f) => ({ ...f, minTVL }))
            }}
            min={100}
            max={1000000}
            step={1000}
          />
        </div>
        <div className="w-full space-y-1">
          <span className="text-sm">Search Pool</span>
          <Input
            placeholder="Search pool, ex: USDC-USDT"
            onChange={(e) => {
              setFilterDebounced((f) => ({ ...f, search: e.target.value }))
            }}
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {paginatedPools.map((pool) => {
          const perDay = pool.fees_24h / Number(pool.liquidity)
          const perYear = perDay * 365

          return (
            <div key={pool.address} className="rounded-md border p-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  <TokenAvatar address={pool.mint_x} />
                  <TokenAvatar address={pool.mint_y} />
                </div>
                <span className="font-bold">{pool.name}</span>
                <Badge className="rounded-full" variant="secondary">
                  BIN {pool.bin_step}
                </Badge>
                <Badge className="ml-auto rounded-full">
                  {numbro(perDay).format("0.00a%")} Per Day
                </Badge>
              </div>
              <div className="flex text-sm">
                <div>
                  <span>TVL</span>
                  <span className="ml-1">
                    {numbro(pool.liquidity).format("$0,0.00a")}
                  </span>
                </div>
                <div className="ml-auto">
                  <span>APY</span>
                  <span className="ml-1">
                    {numbro(perYear).format("0.00%")}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
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
