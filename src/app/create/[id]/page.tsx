"use client"

import { useRouter } from "next/navigation"
import { POOL_URL } from "@/services/pool"
import { createUserPosition, getPositionPublicKey } from "@/services/position"
import useUmiStore from "@/store/useUmiStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Loader2, RefreshCw } from "lucide-react"
import numbro from "numbro"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useSWRConfig } from "swr"
import useSWR from "swr/immutable"
import { z } from "zod"

import { Pool } from "@/types/pool"
import { cn } from "@/lib/utils"
import { createPositionSchema } from "@/lib/zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import Header from "@/components/header"
import { TokenAvatar } from "@/components/tokenAvatar"

export default function Page({ params: { id } }: { params: { id: string } }) {
  const wallet = useWallet()

  const pool = useSWR<Pool>(
    ["pool", id],
    () => fetch(`${POOL_URL}/${id}`).then((res) => res.json()),
    {
      refreshInterval: 10000, // 10 seconds
      keepPreviousData: true,
    }
  )
  const poolUserPublicKey = useSWR<string | null>(
    ["pool-user-public-key", id, wallet.publicKey],
    async ([, id, pk]) => {
      if (!pk) return null
      return getPositionPublicKey((pk as any).toBase58(), id as string)
    }
  )

  const form = useForm<z.infer<typeof createPositionSchema>>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      total_bin_range: 40,
      pool_slippage: 0.01,
      rebalance_slippage: 0.02,
    },
  })

  const { mutate } = useSWRConfig()
  const { push } = useRouter()

  const onSubmit = form.handleSubmit(async (data) => {
    if (!pool.data) return
    if (!wallet.publicKey) return

    await createUserPosition({
      pool_address: pool.data.address,
      pool_slippage: data.pool_slippage,
      rebalance_slippage: data.rebalance_slippage,
      token0_address: pool.data.mint_x,
      token1_address: pool.data.mint_y,
      total_bin_range: data.total_bin_range,
      user_address: wallet.publicKey.toBase58(),
      rpc: data.rpc || undefined,
    })

    toast.success("Position created successfully.")
    mutate("userPools")
    push("/")
  })

  const mintXBalance = useSWR(
    ["mint-x-balance", poolUserPublicKey.data, pool.data?.mint_x],
    async ([, publicKey, mintX]) => {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "")
      if (!publicKey) return
      if (!mintX) return

      if (mintX === "So11111111111111111111111111111111111111112") {
        return await connection
          .getBalance(new PublicKey(publicKey))
          .then((b) => b / 10 ** 9)
      }

      const token = await connection.getTokenAccountsByOwner(
        new PublicKey(publicKey),
        {
          mint: new PublicKey(mintX),
        }
      )
      if (!token.value.length) return 0
      const tokenAmount = await connection.getTokenAccountBalance(
        token.value[0].pubkey
      )
      return (
        tokenAmount.value.uiAmount ||
        Number(tokenAmount.value.uiAmountString || "0")
      )
    }
  )

  const mintYBalance = useSWR(
    ["mint-y-balance", poolUserPublicKey.data, pool.data?.mint_y],
    async ([, publicKey, mintY]) => {
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "")
      if (!publicKey) return
      if (!mintY) return

      if (mintY === "So11111111111111111111111111111111111111112") {
        return await connection
          .getBalance(new PublicKey(publicKey))
          .then((b) => b / 10 ** 9)
      }

      const token = await connection.getTokenAccountsByOwner(
        new PublicKey(publicKey),
        {
          mint: new PublicKey(mintY),
        }
      )
      if (!token.value.length) return 0
      const tokenAmount = await connection.getTokenAccountBalance(
        token.value[0].pubkey
      )
      return (
        tokenAmount.value.uiAmount ||
        Number(tokenAmount.value.uiAmountString || "0")
      )
    }
  )

  return (
    <main className="container flex min-h-screen flex-col gap-4 py-4">
      <Header />
      {!pool.data ? (
        <div className="flex w-full justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <h1 className="inline-flex items-center gap-2 text-2xl font-bold">
                Create {pool.data?.name} Position{" "}
                <Badge className="rounded-full">
                  Bin {pool.data?.bin_step}
                </Badge>
              </h1>
              <h2 className="text-xl font-bold">Position Settings</h2>
              <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="total_bin_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Total Bin Range: {field.value} (
                        {numbro(
                          (field.value * (pool.data?.bin_step || 0)) / 10000
                        ).format("0.00%")}
                        )
                      </FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          min={1}
                          max={1000}
                          step={1}
                        />
                      </FormControl>
                      <FormDescription>
                        The total +- range from initial position price before
                        rebalancing, in basis points.
                      </FormDescription>
                      <div className="text-sm">
                        <div>
                          Current Price{" "}
                          {numbro(pool.data?.current_price || 0).format(
                            "0,0.[000000]"
                          )}{" "}
                        </div>
                        <div>
                          Rebalance at{" "}
                          {numbro(
                            (pool.data?.current_price || 0) *
                              (1 +
                                (field.value / 10000) *
                                  (pool.data?.bin_step || 0))
                          ).format("0,0.[000000]")}{" "}
                          <span className="text-green-400">
                            (+
                            {numbro(
                              (field.value / 10000) * (pool.data?.bin_step || 0)
                            ).format("0.00%")}
                            )
                          </span>{" "}
                          and{" "}
                          {numbro(
                            Math.max(
                              (pool.data?.current_price || 0) *
                                (1 -
                                  (field.value / 10000) *
                                    (pool.data?.bin_step || 0)),
                              0
                            )
                          ).format("0,0.[000000]")}{" "}
                          <span className="text-red-400">
                            (-
                            {numbro(
                              Math.min(
                                (field.value / 10000) *
                                  (pool.data?.bin_step || 0),
                                1
                              )
                            ).format("0.00%")}
                            )
                          </span>{" "}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rpc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RPC Endpoint</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://api.mainnet-beta.solana.com"
                          className="placeholder:opacity-50"
                        />
                      </FormControl>
                      <FormDescription>
                        The Solana RPC endpoint to use for the position.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pool_slippage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Pool Slippage: {numbro(field.value).format("0.00%")}
                      </FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          min={0.001}
                          max={0.1}
                          step={0.001}
                        />
                      </FormControl>
                      <FormDescription>
                        The maximum slippage allowed for pool related
                        operations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rebalance_slippage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Rebalance Slippage:{" "}
                        {numbro(field.value).format("0.00%")}
                      </FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                          min={0.001}
                          max={0.1}
                          step={0.001}
                        />
                      </FormControl>
                      <FormDescription>
                        The maximum slippage allowed for rebalancing (swap)
                        operations.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <h2 className="text-xl font-bold">Fund Position Account</h2>
              {!poolUserPublicKey.data ? (
                <div>Connect your wallet to fund your position account.</div>
              ) : (
                <>
                  <div>
                    Send {pool.data.name.split("-")[0]} or{" "}
                    {pool.data.name.split("-")[1]} to{" "}
                    <span className="font-mono">{poolUserPublicKey.data}</span>
                  </div>
                  <div className="flex gap-2">
                    <TokenAvatar
                      address={pool.data.mint_x}
                      className="size-10"
                    />
                    <div>
                      <div className="font-bold">
                        {pool.data.name.split("-")[0]}
                      </div>
                      <div className="inline-flex items-center text-sm">
                        Balance:{" "}
                        {numbro(mintXBalance.data || 0).format("0,0.[00]a")}{" "}
                        <RefreshCw
                          className={cn(
                            "ml-1 size-3 cursor-pointer",
                            mintXBalance.isValidating && "animate-spin"
                          )}
                          onClick={() => mintXBalance.mutate()}
                        />
                      </div>
                    </div>
                    <div className="w-8" />
                    <TokenAvatar
                      address={pool.data.mint_y}
                      className="size-10"
                    />
                    <div>
                      <div className="font-bold">
                        {pool.data.name.split("-")[1]}
                      </div>
                      <div className="inline-flex items-center text-sm">
                        Balance:{" "}
                        {numbro(mintYBalance.data || 0).format("0,0.[00]a")}{" "}
                        <RefreshCw
                          className={cn(
                            "ml-1 size-3 cursor-pointer",
                            mintYBalance.isValidating && "animate-spin"
                          )}
                          onClick={() => mintYBalance.mutate()}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <Button
                  type="reset"
                  onClick={() => form.reset()}
                  className="mr-2"
                  variant="outline"
                >
                  Reset
                </Button>
                <Button type="submit" disabled={!wallet.publicKey}>
                  {wallet.publicKey ? "Create Position" : "Connect Wallet"}{" "}
                  {form.formState.isSubmitting && (
                    <Loader2 className={cn("ml-2 size-4 animate-spin")} />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </main>
  )
}
