import { redirect } from 'next/navigation'

export default function Home() {
  // Default demo redirect — change "aya" to any valid gift ID
  redirect('/gift/aya')
}
