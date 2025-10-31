import Image from 'next/image';

const EarningStatCards = ({ stats }) => (
    <div
        className="
            grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-y-8 xl:gap-y-0 xs:grid-cols-1
        "
    >
        {stats.map((stat, i) => (
            <div
                key={i}
                className="
                    flex flex-col gap-2 bg-[#F8F8F8] rounded-lg shadow p-4
                    sm:p-3 xs:p-3 max-w-[350px] w-full
                "
            >
                <Image
                    src={stat.icon}
                    alt="Stat icon"
                    width={40}
                    height={40}
                    className="sm:w-8 sm:h-8 xl:w-10 xl:h-10"
                />
                <span className="text-[#828282] text-lg sm:text-base xs:text-sm">
                    {stat.title}
                </span>
                <p className="text-2xl font-bold sm:text-xl xl:text-2xl">{stat.amount}</p>
                <p className="flex flex-wrap gap-1 text-sm text-[#4F4F4F] sm:text-xs">
                    {stat.trendIcon ? (
                        <Image
                            src={stat.trendIcon}
                            alt="Trend icon"
                            width={17.3}
                            height={17.3}
                            className="sm:w-4 sm:h-4"
                        />
                    ) : (
                        'Updated'
                    )}
                    <span className="text-[#25C348] text-xs">{stat.trend}</span> {stat.date}
                </p>
            </div>
        ))}
    </div>
);

export default EarningStatCards;
