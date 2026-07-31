using hackaton.Common;

namespace hackaton.Infrastructure.Routing;

public static class EndpointExtensions
{
    public static void MapEndpoints(this IEndpointRouteBuilder app)
    {
        var types = typeof(IEndpoint).Assembly.GetTypes()
            .Where(t => typeof(IEndpoint).IsAssignableFrom(t) && t is { IsClass: true, IsAbstract: false });

        foreach (var type in types)
        {
            var endpoint = (IEndpoint)Activator.CreateInstance(type)!;
            endpoint.MapEndpoint(app);
        }
    }
}
