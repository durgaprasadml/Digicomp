import { Suspense } from 'react'
import { Outlet, Link, useLocation } from '@typeroute/router'

import { account, accountTab, home } from '../../routes'
import { Container, Section } from '../../components'
import { getCleanPath } from '../../utils/helper'

export default function Test() {
	const { path } = useLocation()
	const page = getCleanPath(path)
	const parts = page.split('/')
	const tab = parts.length > 1 ? parts[1] : 'dashboard'

	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', to: account },
		{ id: 'orders', label: 'Orders', to: accountTab, params: { tab: 'orders' } },
		{ id: 'downloads', label: 'Downloads', to: accountTab, params: { tab: 'downloads' } },
		{ id: 'edit-address', label: 'Addresses', to: accountTab, params: { tab: 'edit-address' } },
		{ id: 'edit-account', label: 'Account details', to: accountTab, params: { tab: 'edit-account' } },
		{ id: 'logout', label: 'Logout', to: home } // Placeholder
	]

	return (
		<Container className="py-8 max-w-7xl">
			<Section className="mb-8">
				<h1 className="text-3xl font-semibold mt-4">My Account</h1>
			</Section>

			<div className="flex flex-col md:flex-row gap-8 lg:gap-12">
				<aside className="w-full md:w-64 shrink-0">
					<nav className="flex flex-col gap-1">
						{navItems.map((item, index) => {
							const isActive = tab === item.id;
							return (
								<Link
									key={item.id}
									to={item.to}
									params={item.params}
									preload="intent"
									className={ `px-4 py-2.5 rounded-lg font-medium ${isActive
										? 'bg-surface text-primary-foreground border-l-4 border-accent'
										: 'hover:bg-(--color-background-secondary)'}`}
								>
									{item.label}
								</Link>
							)
						})}
					</nav>
				</aside>

				<Suspense fallback={
					<div className="pt-6 flex-1 flex items-center justify-center">
					<div class="w-28 h-5 rounded-4xl border-2 relative overflow-hidden text-[var(--text-secondary)]">
						<div className="loadbus absolute m-0.5 w-3 inset-y-0 -left-5 bg-[var(--color-accent-start)]"></div>
					</div>
					</div>
				}>
					<Outlet />
				</Suspense>
			</div>
		</Container>
	)
}
