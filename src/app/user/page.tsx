import Image from "next/image";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold mb-4">Welcome to Schedula!</h1>
            <p className="text-lg text-center max-w-2xl">
                Schedula is your ultimate scheduling companion, designed to help you manage your time effectively and stay organized. Whether you're planning meetings, setting reminders, or tracking tasks, Schedula has got you covered.
            </p>
        </div>
    );
}   