"use client"

import { useEffect, useMemo, useState } from "react"
import { ALL_POOLS_URL } from "@/services/pool"
import { getAllUserPositions } from "@/services/position"
import { useWallet } from "@solana/wallet-adapter-react"
import _ from "lodash"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  Coins,
  Gauge,
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

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 0 }))
  }, [filter])

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

  const wallet = useWallet()

  const userPools = useSWR(["userPools", wallet.publicKey], async ([pk]) => {
    if (!pk) return []
    return await getAllUserPositions(pk)
  })

  return (
    <main className="container flex min-h-screen flex-col gap-4 py-4">
      <Header />
      {!!userPools.data?.length && (
        <>
          <h1 className="text-2xl font-bold">Your Pools</h1>
        </>
      )}
      <h1 className="text-2xl font-bold">All Pools</h1>
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
      <div className="grid gap-2 md:grid-cols-5">
        {paginatedPools.map((pool) => {
          const perDay = pool.fees_24h / Number(pool.liquidity)
          const perYear = perDay * 365

          return (
            <div key={pool.address} className="space-y-2 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <TokenAvatar address={pool.mint_x} />
                  <TokenAvatar address={pool.mint_y} />
                </div>
                <span className="truncate font-bold">{pool.name}</span>
              </div>
              <div className="space-y-0.5 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CircleDollarSign className="size-4" />
                  <span>TVL</span>
                  <span className="ml-auto font-semibold text-primary">
                    {numbro(pool.liquidity).format("$0,0.00a")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Coins className="size-4" />
                  <span>Daily %</span>
                  <span className="ml-auto font-semibold text-green-400">
                    &gt;{numbro(perDay).format("0,0.00a%")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Gauge className="size-4" />
                  <span>Bin Step</span>
                  <span className="ml-auto font-semibold text-primary">
                    {numbro(pool.bin_step).format()}
                  </span>
                </div>
              </div>
              <Button className="ml-auto w-full" variant="secondary" size="sm">
                Create Position
              </Button>
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
