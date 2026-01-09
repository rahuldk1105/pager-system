#!/bin/bash

echo "🧪 Comprehensive Testing Suite for Pager Backend"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    local status=$1
    local message=$2
    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✅ $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

# Function to run tests with coverage
run_unit_tests() {
    echo "📝 Running Unit Tests..."
    npm run test:cov
    local exit_code=$?
    print_status $exit_code "Unit tests completed"
    return $exit_code
}

# Function to run integration tests
run_integration_tests() {
    echo "🔗 Running Integration Tests..."
    npm run test:e2e
    local exit_code=$?
    print_status $exit_code "Integration tests completed"
    return $exit_code
}

# Function to run security tests
run_security_tests() {
    echo "🔒 Running Security Tests..."
    npx jest test/security.e2e-spec.ts --config test/jest-e2e.json
    local exit_code=$?
    print_status $exit_code "Security tests completed"
    return $exit_code
}

# Function to run load tests
run_load_tests() {
    echo "⚡ Running Load Tests..."
    # Check if Artillery is available
    if command -v artillery &> /dev/null; then
        artillery run test/load-test.yml
        local exit_code=$?
        print_status $exit_code "Load tests completed"
        return $exit_code
    else
        echo -e "${YELLOW}⚠️  Artillery not installed, skipping load tests${NC}"
        return 0
    fi
}

# Function to check code quality
check_code_quality() {
    echo "🧹 Checking Code Quality..."

    # Check if ESLint is configured
    if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
        npx eslint src/**/*.ts
        local eslint_exit=$?
    else
        echo -e "${YELLOW}⚠️  ESLint not configured, skipping lint check${NC}"
        local eslint_exit=0
    fi

    # Check TypeScript compilation
    npx tsc --noEmit
    local tsc_exit=$?

    local combined_exit=$((eslint_exit || tsc_exit))
    print_status $combined_exit "Code quality checks completed"
    return $combined_exit
}

# Function to analyze test coverage
analyze_coverage() {
    echo "📊 Analyzing Test Coverage..."

    if [ -d "coverage" ]; then
        # Check coverage thresholds
        local coverage=$(grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*' coverage/coverage-summary.json | grep -o '[0-9]*' | tail -2 | head -1)
        local total=$(grep -o '"lines":{"total":[0-9]*,"covered":[0-9]*' coverage/coverage-summary.json | grep -o '[0-9]*' | tail -1)

        if [ "$total" -gt 0 ]; then
            local percentage=$((coverage * 100 / total))
            echo "Coverage: ${percentage}% (${coverage}/${total} lines)"

            if [ "$percentage" -ge 80 ]; then
                print_status 0 "Coverage threshold met (80%)"
                return 0
            else
                print_status 1 "Coverage below threshold (80%)"
                return 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  No coverage report found${NC}"
        return 0
    fi
}

# Function to run all tests
run_all_tests() {
    local overall_status=0

    check_code_quality
    overall_status=$((overall_status || $?))

    run_unit_tests
    overall_status=$((overall_status || $?))

    run_integration_tests
    overall_status=$((overall_status || $?))

    run_security_tests
    overall_status=$((overall_status || $?))

    run_load_tests
    overall_status=$((overall_status || $?))

    analyze_coverage
    overall_status=$((overall_status || $?))

    return $overall_status
}

# Function to generate test report
generate_report() {
    echo ""
    echo "📋 Test Execution Summary"
    echo "=========================="

    if [ -d "coverage" ]; then
        echo "Coverage Report: file://$(pwd)/coverage/lcov-report/index.html"
    fi

    if [ -d "test-results" ]; then
        echo "Test Results: $(pwd)/test-results/"
    fi

    echo ""
    echo "Next Steps:"
    echo "- Review failed tests and fix issues"
    echo "- Address security vulnerabilities"
    echo "- Optimize performance bottlenecks"
    echo "- Improve test coverage if below 80%"
}

# Main execution
main() {
    local start_time=$(date +%s)

    echo "🚀 Starting comprehensive test suite..."
    echo ""

    run_all_tests
    local test_status=$?

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo ""
    echo "⏱️  Total execution time: ${duration} seconds"

    generate_report

    if [ $test_status -eq 0 ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed! Ready for Phase 4.${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}💥 Some tests failed. Please review and fix issues before proceeding.${NC}"
        exit 1
    fi
}

# Run main function
main "$@"