
interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <div className="bg-black h-screen">
            {children}
        </div>
    )
}

export default Layout