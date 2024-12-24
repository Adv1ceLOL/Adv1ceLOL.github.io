Imports System.Net.Http
Imports System.Text.Json
Imports System.Linq

Public Class CertificateAnalyzer
    Private Const API_ENDPOINT As String = "https://crt.sh/?q={0}&output=json"

    ' Main method to run the analysis
    Public Shared Sub Main()
        ' List of domains to analyze
        Dim domains As String() = {"google.com", "microsoft.com", "github.com"}

        ' Analyze certificates for each domain
        For Each domain In domains
            AnalyzeDomainCertificates(domain)
        Next
    End Sub

    ' Method to fetch and analyze certificates for a specific domain
    Public Shared Async Sub AnalyzeDomainCertificates(domain As String)
        Try
            ' Fetch certificate data
            Dim certificates As List(Of Certificate) = Await FetchCertificatesAsync(domain)

            ' Perform statistical analysis
            Dim analysis As CertificateAnalysis = PerformAnalysis(certificates)

            ' Display results
            DisplayResults(domain, analysis)

        Catch ex As Exception
            Console.WriteLine($"Error analyzing {domain}: {ex.Message}")
        End Try
    End Sub

    ' Fetch certificates from crt.sh API
    Private Shared Async Function FetchCertificatesAsync(domain As String) As Task(Of List(Of Certificate))
        Using client As New HttpClient()
            Dim url As String = String.Format(API_ENDPOINT, domain)
            Dim response As String = Await client.GetStringAsync(url)

            ' Parse JSON response
            Dim options As New JsonSerializerOptions()
            options.PropertyNameCaseInsensitive = True

            Dim certData As List(Of Certificate) = 
                JsonSerializer.Deserialize(Of List(Of Certificate))(response, options)

            Return certData
        End Using
    End Function

    ' Perform statistical analysis on certificates
    Private Shared Function PerformAnalysis(certificates As List(Of Certificate)) As CertificateAnalysis
        Dim analysis As New CertificateAnalysis()

        ' Calculate certificate issuer distribution
        analysis.IssuerDistribution = 
            certificates.GroupBy(Function(c) c.Issuer_name)
            .Select(Function(g) New With {
                .Issuer = g.Key,
                .Count = g.Count()
            })
            .OrderByDescending(Function(x) x.Count)
            .ToList()

        ' Calculate average validity period
        analysis.AverageValidityDays = 
            certificates.Average(Function(c) 
                (c.Not_after - c.Not_before).TotalDays)

        ' Count unique key lengths
        analysis.KeyLengthDistribution = 
            certificates.GroupBy(Function(c) c.Pubkey_size)
            .Select(Function(g) New With {
                .KeyLength = g.Key,
                .Count = g.Count()
            })
            .OrderBy(Function(x) x.KeyLength)
            .ToList()

        Return analysis
    End Function

    ' Display analysis results
    Private Shared Sub DisplayResults(domain As String, analysis As CertificateAnalysis)
        Console.WriteLine($"Certificate Analysis for {domain}")
        Console.WriteLine("----------------------------")

        ' Display issuer distribution
        Console.WriteLine("Certificate Issuer Distribution:")
        For Each issuer In analysis.IssuerDistribution
            Console.WriteLine($"{issuer.Issuer}: {issuer.Count} certificates")
        Next

        ' Display average validity
        Console.WriteLine($"Average Certificate Validity: {analysis.AverageValidityDays:F2} days")

        ' Display key length distribution
        Console.WriteLine("Key Length Distribution:")
        For Each keyLength In analysis.KeyLengthDistribution
            Console.WriteLine($"{keyLength.KeyLength} bits: {keyLength.Count} certificates")
        Next
    End Sub

    ' Certificate data model
    Public Class Certificate
        Public Property Issuer_name As String
        Public Property Not_before As Date
        Public Property Not_after As Date
        Public Property Pubkey_size As Integer
    End Class

    ' Analysis results container
    Public Class CertificateAnalysis
        Public Property IssuerDistribution As List(Of Object)
        Public Property AverageValidityDays As Double
        Public Property KeyLengthDistribution As List(Of Object)
    End Class
End Class
